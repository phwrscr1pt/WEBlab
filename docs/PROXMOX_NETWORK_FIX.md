# Proxmox Network Troubleshooting Session

**Date:** 2026-04-19
**Server:** cyberlab2 (10.10.61.11)
**Issue:** VMs cannot access the internet

---

## Problem Description

VMs running on the Proxmox server `cyberlab2` (10.10.61.11) were unable to access the internet. The server hosts multiple VMs including:
- Tailscale routers
- CTFd platform
- OPNsense router
- Student lab VMs

---

## Root Cause

**The Proxmox firewall bridge interfaces (`fwpr*`) were NOT connected to the main bridges (`vmbr0`, `vmbr100`).**

### Expected Network Path
```
VM NIC → tap interface → fwbr (firewall bridge) → fwpr → vmbr (main bridge) → physical NIC
```

### Actual State (Broken)
```
VM NIC → tap interface → fwbr (firewall bridge) → fwpr → (DISCONNECTED!)
```

### Evidence
```bash
# Before fix - vmbr0 only had physical NIC
$ brctl show vmbr0
bridge name     bridge id               STP enabled     interfaces
vmbr0           8000.ac162d713b18       no              nic0

# fwpr interfaces existed but had no master bridge
$ ip link show fwpr123p0
97: fwpr123p0@fwln123i0: <BROADCAST,MULTICAST,UP,LOWER_UP> ...
# Note: No "master vmbr0" shown
```

---

## Solution Applied

### 1. Manual Fix (Immediate)

Connected all firewall bridge interfaces to their correct bridges:

```bash
# VMs on vmbr0 (main network with internet)
brctl addif vmbr0 fwpr102p0   # tailscale-router-Arm
brctl addif vmbr0 fwpr123p0   # ctfd-summer5
brctl addif vmbr0 fwpr124p0   # tailscale-router-Nhuea
brctl addif vmbr0 fwpr126p0   # tailscale-router-Focus
brctl addif vmbr0 fwpr129p0   # opensense-router (WAN)
brctl addif vmbr0 fwpr130p0   # tailscale-router-Eng
brctl addif vmbr0 fwpr134p0   # http-curl
brctl addif vmbr0 fwpr140p0   # router-hackday-std01
brctl addif vmbr0 fwpr141p0   # router-hackday-std02
brctl addif vmbr0 fwpr142p0   # router-hackday-std03
brctl addif vmbr0 fwpr143p0   # router-hackday-std04
brctl addif vmbr0 fwpr144p0   # router-hackday-std05
brctl addif vmbr0 fwpr145p0   # router-hackday-std06
brctl addif vmbr0 fwpr146p0   # router-hackday-std07

# VMs on vmbr100 (isolated network via OPNsense)
brctl addif vmbr100 fwpr129p1  # opensense-router (LAN)
brctl addif vmbr100 fwpr132p0  # nmap-ubuntu
brctl addif vmbr100 fwpr133p0  # metasploitable2
```

### 2. Permanent Fix (Systemd Service)

Created automated fix that runs on boot and every 60 seconds.

#### Script: `/usr/local/bin/fix-vm-bridges.sh`
```bash
#!/bin/bash
# Fix Proxmox VM bridge connections
# This script ensures fwpr interfaces are connected to their bridges

LOG=/var/log/fix-vm-bridges.log

log() {
    echo "$(date): $1" >> $LOG
}

fix_bridges() {
    # Get all running VMs
    for vmid in $(qm list | awk "NR>1 {print \$1}"); do
        # Get VM config and find network interfaces
        while read -r line; do
            if [[ $line =~ ^net([0-9]+):.*bridge=([^,]+) ]]; then
                netid="${BASH_REMATCH[1]}"
                bridge="${BASH_REMATCH[2]}"
                fwpr="fwpr${vmid}p${netid}"

                # Check if fwpr exists and is not in bridge
                if ip link show $fwpr &>/dev/null; then
                    current_master=$(ip link show $fwpr | grep -oP "master \K\S+")
                    if [[ "$current_master" != "$bridge" ]]; then
                        brctl addif $bridge $fwpr 2>/dev/null
                        if [[ $? -eq 0 ]]; then
                            log "Added $fwpr to $bridge (VM $vmid)"
                        fi
                    fi
                fi
            fi
        done < <(qm config $vmid 2>/dev/null)
    done
}

fix_bridges
```

#### Service: `/etc/systemd/system/fix-vm-bridges.service`
```ini
[Unit]
Description=Fix Proxmox VM Bridge Connections
After=network.target pve-cluster.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/fix-vm-bridges.sh

[Install]
WantedBy=multi-user.target
```

#### Timer: `/etc/systemd/system/fix-vm-bridges.timer`
```ini
[Unit]
Description=Run VM bridge fix every minute

[Timer]
OnBootSec=30s
OnUnitActiveSec=60s

[Install]
WantedBy=timers.target
```

#### Enable Services
```bash
chmod +x /usr/local/bin/fix-vm-bridges.sh
systemctl daemon-reload
systemctl enable fix-vm-bridges.service
systemctl enable fix-vm-bridges.timer
systemctl start fix-vm-bridges.timer
```

---

## Network Architecture

### Physical Network
```
Internet
    │
    ▼
Gateway (10.10.61.4)
    │
    ▼
┌─────────────────────────────────────────┐
│  Proxmox Host: cyberlab2 (10.10.61.11)  │
│                                         │
│  nic0 ─────► vmbr0 (10.10.61.0/24)     │
│                │                        │
│                ├── VM 102 (10.10.61.102)│
│                ├── VM 123 (CTFd)        │
│                ├── VM 124 (Tailscale)   │
│                ├── VM 126 (Tailscale)   │
│                ├── VM 129 (OPNsense)────┼──► vmbr100 (isolated)
│                ├── VM 130 (Tailscale)   │         │
│                ├── VM 134 (http-curl)   │         ├── VM 132 (nmap)
│                └── VM 140-146 (routers) │         └── VM 133 (metasploit)
│                                         │
└─────────────────────────────────────────┘
```

### Bridge Configuration

| Bridge | Purpose | Connected Interfaces |
|--------|---------|---------------------|
| vmbr0 | Main network (internet access) | nic0, fwpr102p0, fwpr123p0, fwpr124p0, fwpr126p0, fwpr129p0, fwpr130p0, fwpr134p0, fwpr140p0-fwpr146p0 |
| vmbr100 | Isolated network (via OPNsense) | fwpr129p1, fwpr132p0, fwpr133p0 |
| vmbr101-107 | Student isolated networks | Currently unused |

---

## VM Status After Fix

### Confirmed Working

| VMID | Name | IP | Internet |
|------|------|-----|----------|
| 102 | tailscale-router-Arm | 10.10.61.102 | OK (Static IP, guest agent enabled) |
| 123 | ctfd-summer5 | 10.10.61.193 | OK (Cloudflare tunnel active) |
| 124 | tailscale-router-Nhuea | 10.10.61.67 | OK (Tailscale: 100.101.229.93) |
| 129 | opensense-router | 10.10.61.131 | OK |
| 134 | http-curl | 10.10.61.71 | OK (DHCP from 10.10.61.2) |

### Bridge Connected (May Need Internal Config)

| VMID | Name | Bridge | Notes |
|------|------|--------|-------|
| 126 | tailscale-router-Focus | vmbr0 | IPv6 only |
| 130 | tailscale-router-Eng | vmbr0 | IPv6 only |
| 132 | nmap-ubuntu | vmbr100 | Needs OPNsense gateway |
| 133 | metasploitable2 | vmbr100 | Needs OPNsense gateway |
| 140-146 | router-hackday-std* | vmbr0 | Internal DHCP servers |

---

## VM 102 Internal Network Fix (2026-04-20)

VM 102 had bridge connectivity but no IPv4 address. The issue was **inside the VM** - the network interface was DOWN and netplan wasn't configured.

### Problem

```
$ ip addr show ens18
2: ens18: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN
```

- Interface `ens18` was **DOWN**
- No DHCP client (`dhclient: command not found`)
- Netplan not configured for DHCP

### Solution Applied

#### 1. Proxmox-side Configuration

```bash
# Added serial port for terminal access
qm set 102 -serial0 socket

# Added cloud-init drive
qm set 102 --ide0 local-lvm:cloudinit
qm set 102 --ipconfig0 ip=10.10.61.102/24,gw=10.10.61.4

# Enabled QEMU guest agent
qm set 102 --agent 1
```

#### 2. Inside VM (via console)

```bash
# Bring interface up
sudo ip link set ens18 up

# Create netplan config with static IP
sudo tee /etc/netplan/01-netcfg.yaml << 'EOF'
network:
  version: 2
  ethernets:
    ens18:
      addresses:
        - 10.10.61.102/24
      routes:
        - to: default
          via: 10.10.61.4
      nameservers:
        addresses:
          - 8.8.8.8
EOF

sudo chmod 600 /etc/netplan/01-netcfg.yaml
sudo netplan apply
```

#### 3. Install Guest Agent

```bash
sudo apt update && sudo apt install -y qemu-guest-agent
sudo systemctl enable qemu-guest-agent
sudo systemctl start qemu-guest-agent
```

### Verification

```bash
# From Proxmox host
ping -c 3 10.10.61.102
qm agent 102 ping
qm agent 102 network-get-interfaces
```

### VM 102 Final Configuration

| Item | Value |
|------|-------|
| Name | tailscale-router-Arm |
| IP | 10.10.61.102/24 |
| Gateway | 10.10.61.4 |
| MAC | bc:24:11:6e:48:6d |
| Guest Agent | Enabled |
| Serial Port | socket |
| Cloud-init | Configured |

---

## Troubleshooting Commands

### Check Bridge Status
```bash
# View all bridges
brctl show

# Check specific bridge
brctl show vmbr0

# Check if fwpr interface has master
ip link show fwpr123p0 | grep master
```

### Check VM Network Config
```bash
# View VM config
qm config 123 | grep net

# List running VMs
qm list
```

### Fix Service Status
```bash
# Check timer status
systemctl status fix-vm-bridges.timer

# View fix log
cat /var/log/fix-vm-bridges.log

# Run fix manually
/usr/local/bin/fix-vm-bridges.sh
```

### Network Diagnostics
```bash
# ARP table
arp -a

# Neighbor table
ip neigh show

# Capture traffic
tcpdump -i vmbr0 -e -c 20

# Test connectivity from VM
ssh user@10.10.61.67 'ping -c 3 8.8.8.8'
```

---

## SSH Access Configuration

### SSH Config (~/.ssh/config)
```
Host jump
    HostName 100.107.182.15
    User root-agent

Host thaimart-lab
    HostName 10.10.61.87
    User asdf
    ProxyJump jump

Host cyberlab2
    HostName 10.10.61.11
    User root
    ProxyJump jump

Host vm102
    HostName 10.10.61.102
    User user
    ProxyJump jump
```

### Quick Access
```bash
# Access Proxmox host
ssh cyberlab2

# Access via jump host manually
ssh -J root-agent@100.107.182.15 root@10.10.61.11
```

### Credentials
| Host | User | Auth |
|------|------|------|
| 100.107.182.15 (jump) | root-agent | SSH key |
| 10.10.61.11 (cyberlab2) | root | SSH key (configured during session) |
| 10.10.61.67 (VM 124) | user | SSH key / password: tailuser11 |
| 10.10.61.102 (VM 102) | user | SSH key |

---

## Possible Proxmox Bug

This issue appears to be a bug in Proxmox where the firewall bridge interfaces are not automatically connected to the main bridges after VM startup. The issue manifests when:
- VMs have `firewall=1` in their network config
- The fwpr/fwln veth pairs are created but fwpr is not added to vmbr

### Workaround
The systemd timer service ensures bridges are connected every 60 seconds.

### Permanent Solution
Consider reporting this to Proxmox if it persists after Proxmox updates.

---

## Related Files

| File | Purpose |
|------|---------|
| `/usr/local/bin/fix-vm-bridges.sh` | Bridge fix script |
| `/etc/systemd/system/fix-vm-bridges.service` | Systemd service |
| `/etc/systemd/system/fix-vm-bridges.timer` | 60-second timer |
| `/var/log/fix-vm-bridges.log` | Fix log file |
| `/etc/network/interfaces` | Network config |
| `/etc/pve/qemu-server/*.conf` | VM configurations |

---

*Document created: 2026-04-19*
*Last updated: 2026-04-20 - Added VM 102 internal network fix*
