# 🔗 Creative Link API

**Endpoint:** `/api/performance/creative-link`  
**Method:** `GET`  
**Purpose:** Fetch creative preview links from N8N webhook for META ads with intelligent caching

---

## 📋 Overview

This API handles fetching creative preview links for META platform ads. It implements a 4-day cache to avoid unnecessary webhook calls to N8N.

### **Flow:**
```
1. Frontend requests creative link for ad_id
2. API checks Supabase for existing link
3. If link exists and < 4 days old → return cached
4. If link missing or > 4 days old → fetch from N8N webhook
5. Save new link to Supabase with timestamp
6. Return link to frontend
```

---

## 🚀 Usage

### **Request:**
```bash
GET /api/performance/creative-link?ad_id=123456789
```

### **Response (Cached):**
```json
{
  "success": true,
  "ad_id": 123456789,
  "creative_link": "https://meta-creative-preview.com/...",
  "cached": true,
  "link_updated_at": "2025-10-02T14:30:00Z"
}
```

### **Response (Fetched from N8N):**
```json
{
  "success": true,
  "ad_id": 123456789,
  "creative_link": "https://meta-creative-preview.com/...",
  "cached": false,
  "link_updated_at": "2025-10-06T10:15:00Z"
}
```

### **Error Responses:**
```json
// Missing ad_id
{
  "success": false,
  "error": "Missing ad_id parameter"
}

// Ad not found
{
  "success": false,
  "error": "Ad not found"
}

// Not META platform
{
  "success": false,
  "error": "Creative link webhook only available for META platform"
}

// N8N webhook failed
{
  "success": false,
  "error": "Failed to fetch creative link from N8N"
}
```

---

## ⚙️ Configuration

### **Environment Variables:**
```bash
# Required: N8N webhook URL (CloudWalk Growth)
N8N_CREATIVE_LINK_WEBHOOK_URL=https://cloudwalk-growth.app.n8n.cloud/webhook/a5c24fb4-12df-415e-85c3-0a2e38b6f966

# Already configured (Supabase Growth DB)
NEXT_PUBLIC_SUPABASE_URL_GROWTH=...
SUPABASE_SERVICE_ROLE_KEY_GROWTH=...
```

### **Cache Settings:**
- **Cache validity:** 4 days
- **Location:** `CACHE_VALIDITY_DAYS` constant in `route.ts`

---

## 🗄️ Database Schema

### **Table:** `mkt_ads_looker`

**New Field:**
```sql
link_updated_at TIMESTAMPTZ DEFAULT NULL
```

**Indexes:**
```sql
-- For cache validation queries
CREATE INDEX idx_mkt_ads_looker_link_updated_at ON mkt_ads_looker(link_updated_at);

-- For META platform queries
CREATE INDEX idx_mkt_ads_looker_platform_meta ON mkt_ads_looker(platform) WHERE platform = 'meta';
```

---

## 🔄 N8N Webhook Integration

### **Expected N8N Request:**
```json
POST https://your-n8n-instance.com/webhook/creative-link
Content-Type: application/json

{
  "ad_id": 123456789
}
```

### **Expected N8N Response:**
```json
{
  "creative_link": "https://meta-creative-preview.com/..."
}
```

**Alternative response formats supported:**
```json
{
  "link": "https://..." 
}
```

---

## 🎯 Use Cases

### **1. BestAds Component (Automatic)**
When rendering top 5 META ads, the component automatically:
- Checks if link exists and is valid
- Fetches new link if needed
- Displays preview

### **2. Manual Preview (User Click)**
When user clicks "View Ad" on any META ad:
1. Show confirmation modal: "Deseja ver o preview?"
2. User confirms
3. Show loading (Logo Piadinha)
4. Fetch link via API (uses cache if valid)
5. Display preview

---

## 📊 Performance Considerations

### **Cache Hit Ratio:**
- Expected: ~90% (most ads shown multiple times within 4 days)
- N8N calls reduced by ~90%

### **Response Times:**
- **Cached:** ~50-100ms (Supabase query)
- **Fresh:** ~1-3s (N8N webhook + Supabase update)

---

## 🧪 Testing

### **Manual Test:**
```bash
# Test with real ad_id
curl "http://localhost:3000/api/performance/creative-link?ad_id=120211079278030050"

# Expected: First call fetches from N8N, second call uses cache
```

### **Test Cases:**
1. ✅ Cached link (< 4 days)
2. ✅ Expired link (> 4 days)
3. ✅ Missing link
4. ✅ Non-META platform (should error)
5. ✅ Invalid ad_id (should 404)

---

## 🔐 Security

- ✅ Server-side only (uses service role key)
- ✅ No direct frontend access to N8N webhook
- ✅ Validates platform (META only)
- ✅ Validates ad existence before webhook call

---

## 📝 Notes

- **Platform restriction:** Only works for META (Facebook/Instagram ads)
- **Cache invalidation:** Automatic after 4 days
- **Manual refresh:** Frontend can force refresh by re-calling API (it will check cache automatically)
- **Link expiry:** META creative links have their own expiry (handled by cache logic)

---

## 🚨 Troubleshooting

### **"Failed to fetch creative link from N8N"**
- Check `N8N_CREATIVE_LINK_WEBHOOK_URL` env var
- Verify N8N workflow is running
- Check N8N logs for errors

### **"Creative link webhook only available for META platform"**
- Ad is not META platform (Google/TikTok don't support this feature)
- Check `platform` field in database

### **Slow response times**
- First request for an ad will be slow (N8N webhook)
- Subsequent requests use cache (< 100ms)
- Consider pre-fetching links for BestAds

---

## 🔮 Future Improvements

- [ ] Batch API endpoint (fetch multiple links at once)
- [ ] Pre-fetch links for BestAds asynchronously
- [ ] WebSocket support for real-time preview updates
- [ ] Support for Google/TikTok platforms (if APIs available)
