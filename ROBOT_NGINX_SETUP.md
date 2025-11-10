# Robot Nginx Reverse Proxy Setup

This guide configures nginx to expose both rosbridge and WebRTC signaling through a single port.

## Architecture

```
┌─────────────────────────────────────────┐
│           Single Tunnel URL             │
│      wss://abc123.loca.lt               │
└────────────┬────────────────────────────┘
             │
             ├─→ /rosbridge → localhost:9090
             └─→ /webrtc    → localhost:8080
```

## Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

## Step 2: Create Nginx Configuration

Create the configuration file:

```bash
sudo nano /etc/nginx/sites-available/robot-teleop
```

Add this configuration:

```nginx
server {
    listen 8000;
    server_name _;

    # WebSocket for rosbridge
    location /rosbridge {
        # Strip /rosbridge prefix and proxy to root
        rewrite ^/rosbridge/?(.*)$ /$1 break;
        proxy_pass http://localhost:9090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    # WebRTC signaling (for future use)
    location /webrtc {
        # Strip /webrtc prefix and proxy to root
        rewrite ^/webrtc/?(.*)$ /$1 break;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }
}
```

## Step 3: Enable the Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/robot-teleop /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, restart nginx
sudo systemctl restart nginx

# Enable nginx to start on boot
sudo systemctl enable nginx
```

## Step 4: Verify Nginx is Running

```bash
# Check nginx status
sudo systemctl status nginx

# Verify port 8000 is listening
sudo netstat -tulpn | grep :8000
```

## Step 5: Start Your ROS Services

Make sure rosbridge_server is running on port 9090:

```bash
ros2 run rosbridge_server rosbridge_websocket
# or use your launch file
```

## Step 6: Tunnel Port 8000

```bash
npx localtunnel --port 8000
```

You'll get output like:

```
your url is: https://abc123.loca.lt
```

## Step 7: Test Locally First (Optional)

Before tunneling, test that nginx is working on the local network:

```bash
# On another device on same network, test WebSocket connection
# Replace <robot-ip> with your robot's IP address
wscat -c ws://<robot-ip>:8000/rosbridge
```

## Troubleshooting

### Nginx won't start

```bash
# Check error logs
sudo tail -f /var/log/nginx/error.log

# Common issue: port already in use
sudo lsof -i :8000
```

### rosbridge not connecting

```bash
# Verify rosbridge is running
ros2 node list | grep rosbridge

# Check if port 9090 is listening
sudo netstat -tulpn | grep :9090
```

### Nginx configuration errors

```bash
# Always test config before restarting
sudo nginx -t
```

## What's Next?

Once nginx is running and tunneled:

1. In the web app, add your robot with URL: `wss://abc123.loca.lt`
2. The app will automatically append `/rosbridge` for ROS connection
3. Later, WebRTC will use `/webrtc` path automatically

## Nginx Management Commands

```bash
# Start nginx
sudo systemctl start nginx

# Stop nginx
sudo systemctl stop nginx

# Restart nginx
sudo systemctl restart nginx

# Reload config without dropping connections
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```
