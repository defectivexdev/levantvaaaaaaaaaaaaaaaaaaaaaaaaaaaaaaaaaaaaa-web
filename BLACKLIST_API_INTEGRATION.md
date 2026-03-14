# Levant VA Blacklist API - Integration Guide

## 🌍 Powerful Cross-Website Blacklist System

This API allows you to sync the Levant VA country blacklist across multiple websites and applications.

---

## 📡 API Endpoints

### Base URL
```
https://levant-va.com/api/public/blacklist
```

### 1. Check IP/Country
**Endpoint:** `GET /api/public/blacklist/check`

**Parameters:**
- `ip` (optional) - IP address to check
- `country` (optional) - Country code to check (e.g., US, CA)
- `api_key` (optional) - API key for authentication

**Examples:**
```bash
# Check by IP
GET /api/public/blacklist/check?ip=123.45.67.89

# Check by country code
GET /api/public/blacklist/check?country=US

# Check with API key
GET /api/public/blacklist/check?ip=123.45.67.89&api_key=YOUR_BLACKLIST_API_KEY
```

**Response:**
```json
{
  "blacklisted": true,
  "country_code": "US",
  "country_name": "United States",
  "reason": "Spam attempts",
  "added_at": "2026-03-10T15:00:00.000Z"
}
```

### 2. Get Full Blacklist
**Endpoint:** `GET /api/public/blacklist/list`

**Parameters:**
- `api_key` (optional) - API key for authentication (required only when `BLACKLIST_API_KEY` is set)

**Example:**
```bash
GET /api/public/blacklist/list?api_key=YOUR_BLACKLIST_API_KEY
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "blacklist": [
    {
      "country_code": "US",
      "country_name": "United States",
      "reason": "Spam attempts",
      "added_at": "2026-03-10T15:00:00.000Z"
    },
    {
      "country_code": "CN",
      "country_name": null,
      "reason": null,
      "added_at": "2026-03-10T14:00:00.000Z"
    }
  ],
  "last_updated": "2026-03-10T16:00:00.000Z"
}
```

---

## 🔐 API Key Configuration

**Environment Variable:**
```env
BLACKLIST_API_KEY=your-secret-key-here
```

**How auth works:**
- **If `BLACKLIST_API_KEY` is set** on the server, the public endpoints will **require** an API key.
- **If `BLACKLIST_API_KEY` is not set**, the endpoints will allow requests **without** a key.

**Usage:**
- Query parameter: `?api_key=your-key`
- Header: `X-API-Key: your-key`

---

## 💻 Integration Code Examples

### PHP Integration

```php
<?php
/**
 * Levant VA Blacklist Integration for PHP
 */

class LevantBlacklistChecker {
    private $apiUrl = 'https://levant-va.com/api/public/blacklist';
    private $apiKey = 'YOUR_BLACKLIST_API_KEY';
    
    /**
     * Check if IP is blacklisted
     */
    public function checkIp($ip) {
        $url = $this->apiUrl . '/check?ip=' . urlencode($ip) . '&api_key=' . $this->apiKey;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            return $data['blacklisted'] ?? false;
        }
        
        return false; // Fail open
    }
    
    /**
     * Check if country is blacklisted
     */
    public function checkCountry($countryCode) {
        $url = $this->apiUrl . '/check?country=' . urlencode($countryCode) . '&api_key=' . $this->apiKey;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            return $data['blacklisted'] ?? false;
        }
        
        return false;
    }
    
    /**
     * Get full blacklist
     */
    public function getBlacklist() {
        $url = $this->apiUrl . '/list?api_key=' . $this->apiKey;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            return $data['blacklist'] ?? [];
        }
        
        return [];
    }
    
    /**
     * Get user's IP address
     */
    public function getUserIp() {
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            return $_SERVER['HTTP_CF_CONNECTING_IP'];
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($ips[0]);
        }
        if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
            return $_SERVER['HTTP_X_REAL_IP'];
        }
        return $_SERVER['REMOTE_ADDR'] ?? '';
    }
}

// Usage Example
$checker = new LevantBlacklistChecker();

// Get user's IP
$userIp = $checker->getUserIp();

// Check if IP is blacklisted
if ($checker->checkIp($userIp)) {
    // Block access
    http_response_code(403);
    die('Access from your location is not available.');
}

// Or check by country code
if ($checker->checkCountry('US')) {
    // Block access
    http_response_code(403);
    die('Access from your country is not available.');
}

// Get full blacklist for caching
$blacklist = $checker->getBlacklist();
// Cache this in Redis/Memcached for better performance
?>
```

---

### JavaScript/Node.js Integration

```javascript
/**
 * Levant VA Blacklist Integration for Node.js
 */

class LevantBlacklistChecker {
    constructor(apiUrl = 'https://levant-va.com/api/public/blacklist', apiKey = 'YOUR_BLACKLIST_API_KEY') {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    /**
     * Check if IP is blacklisted
     */
    async checkIp(ip) {
        try {
            const response = await fetch(`${this.apiUrl}/check?ip=${encodeURIComponent(ip)}&api_key=${this.apiKey}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                return data.blacklisted || false;
            }
        } catch (error) {
            console.error('Blacklist check error:', error);
        }
        return false; // Fail open
    }

    /**
     * Check if country is blacklisted
     */
    async checkCountry(countryCode) {
        try {
            const response = await fetch(`${this.apiUrl}/check?country=${encodeURIComponent(countryCode)}&api_key=${this.apiKey}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                return data.blacklisted || false;
            }
        } catch (error) {
            console.error('Blacklist check error:', error);
        }
        return false;
    }

    /**
     * Get full blacklist
     */
    async getBlacklist() {
        try {
            const response = await fetch(`${this.apiUrl}/list?api_key=${this.apiKey}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
                const data = await response.json();
                return data.blacklist || [];
            }
        } catch (error) {
            console.error('Blacklist fetch error:', error);
        }
        return [];
    }

    /**
     * Get user's IP from request
     */
    getUserIp(request) {
        const forwarded = request.headers.get('x-forwarded-for');
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return request.headers.get('x-real-ip') || 
               request.headers.get('cf-connecting-ip') || 
               'unknown';
    }
}

// Express.js Middleware Example
const express = require('express');
const app = express();
const checker = new LevantBlacklistChecker();

app.use(async (req, res, next) => {
    const userIp = checker.getUserIp(req);
    
    if (await checker.checkIp(userIp)) {
        return res.status(403).json({ 
            error: 'Access from your location is not available.' 
        });
    }
    
    next();
});

// Next.js API Route Example
export async function middleware(request) {
    const checker = new LevantBlacklistChecker();
    const userIp = checker.getUserIp(request);
    
    if (await checker.checkIp(userIp)) {
        return NextResponse.json(
            { error: 'Access from your location is not available.' },
            { status: 403 }
        );
    }
    
    return NextResponse.next();
}

module.exports = LevantBlacklistChecker;
```

---

### Python Integration

```python
"""
Levant VA Blacklist Integration for Python
"""

import requests
from typing import Optional, List, Dict

class LevantBlacklistChecker:
    def __init__(self, api_url: str = 'https://levant-va.com/api/public/blacklist', 
                 api_key: str = 'YOUR_BLACKLIST_API_KEY'):
        self.api_url = api_url
        self.api_key = api_key
    
    def check_ip(self, ip: str) -> bool:
        """Check if IP is blacklisted"""
        try:
            response = requests.get(
                f'{self.api_url}/check',
                params={'ip': ip, 'api_key': self.api_key},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('blacklisted', False)
        except Exception as e:
            print(f'Blacklist check error: {e}')
        
        return False  # Fail open
    
    def check_country(self, country_code: str) -> bool:
        """Check if country is blacklisted"""
        try:
            response = requests.get(
                f'{self.api_url}/check',
                params={'country': country_code, 'api_key': self.api_key},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('blacklisted', False)
        except Exception as e:
            print(f'Blacklist check error: {e}')
        
        return False
    
    def get_blacklist(self) -> List[Dict]:
        """Get full blacklist"""
        try:
            response = requests.get(
                f'{self.api_url}/list',
                params={'api_key': self.api_key},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('blacklist', [])
        except Exception as e:
            print(f'Blacklist fetch error: {e}')
        
        return []
    
    @staticmethod
    def get_user_ip(request) -> str:
        """Get user's IP from request (Flask/Django)"""
        if 'HTTP_CF_CONNECTING_IP' in request.environ:
            return request.environ['HTTP_CF_CONNECTING_IP']
        if 'HTTP_X_FORWARDED_FOR' in request.environ:
            ips = request.environ['HTTP_X_FORWARDED_FOR'].split(',')
            return ips[0].strip()
        if 'HTTP_X_REAL_IP' in request.environ:
            return request.environ['HTTP_X_REAL_IP']
        return request.remote_addr

# Flask Example
from flask import Flask, request, jsonify

app = Flask(__name__)
checker = LevantBlacklistChecker()

@app.before_request
def check_blacklist():
    user_ip = checker.get_user_ip(request)
    
    if checker.check_ip(user_ip):
        return jsonify({'error': 'Access from your location is not available.'}), 403

# Django Middleware Example
class BlacklistMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.checker = LevantBlacklistChecker()
    
    def __call__(self, request):
        user_ip = self.checker.get_user_ip(request)
        
        if self.checker.check_ip(user_ip):
            return JsonResponse(
                {'error': 'Access from your location is not available.'},
                status=403
            )
        
        return self.get_response(request)
```

---

## 🚀 Advanced Features

### Caching for Performance

```javascript
// Cache blacklist in memory/Redis for 5 minutes
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

async function getCachedBlacklist() {
    let blacklist = cache.get('blacklist');
    
    if (!blacklist) {
        const checker = new LevantBlacklistChecker();
        blacklist = await checker.getBlacklist();
        cache.set('blacklist', blacklist);
    }
    
    return blacklist;
}

// Check against cached blacklist
async function isCountryBlacklisted(countryCode) {
    const blacklist = await getCachedBlacklist();
    return blacklist.some(entry => entry.country_code === countryCode);
}
```

### Rate Limiting Protection

```javascript
// Add rate limiting to API calls
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60 // 60 requests per minute
});

app.use('/api/public/blacklist', limiter);
```

---

## 📊 Use Cases

1. **Multi-Website Network** - Sync blacklist across all your websites
2. **Partner Integration** - Share blacklist with partner sites
3. **Centralized Security** - Manage security from one location
4. **Real-Time Updates** - Changes propagate to all sites instantly
5. **API Gateway** - Use as security layer for API gateway

---

## ⚡ Performance Tips

1. **Cache the blacklist** - Fetch full list every 5-10 minutes
2. **Use country code checks** - Faster than IP geolocation
3. **Implement fallback** - Always fail open on errors
4. **Set timeouts** - 5 seconds max for checks
5. **Use headers** - Prefer x-vercel-ip-country over API calls

---

## 🔒 Security Best Practices

1. **Use HTTPS** - Always use secure connections
2. **Rotate API keys** - Change keys periodically
3. **Rate limit** - Prevent abuse of public endpoints
4. **Monitor usage** - Track API calls
5. **Fail open** - Don't block legitimate users on errors

---

## 📝 Notes

- API is designed to fail open (allow access on errors)
- API key is required only when `BLACKLIST_API_KEY` is set on the server
- Rate limit: Recommended 60 req/min per IP
- Cache blacklist for better performance
- IP geolocation uses ip-api.com (45 req/min limit)

---

**Your blacklist system is now powerful and can be synced across unlimited websites!** 🌍
