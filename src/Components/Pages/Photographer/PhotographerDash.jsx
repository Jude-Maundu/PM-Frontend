import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PhotographerLayout from "./PhotographerLayout";
import { Link } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../../../api/apiConfig";
import { placeholderSmall } from "../../../utils/placeholders";
import { getImageUrl, fetchProtectedUrl } from "../../../utils/imageUrl";
import { getAuthHeaders, getCurrentUserId, getDisplayName, getStoredUser } from "../../../utils/auth";
import { getConversations } from "../../../api/API";

const API = API_BASE_URL;

/* ── tiny helpers ────────────────────────────────────────────────── */
const Sparkline = ({ values = [], color = "#5B7FE5", height = 36, width = 100 }) => {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / Math.max(values.length - 1, 1)) * width,
    y: height - ((v - min) / range) * height * 0.85 + 2,
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const fill = pts.map((p, i) => i === 0 ? `M ${p.x.toFixed(1)} ${height}` : "").join("") +
    d.replace("M", "L") + ` L ${width} ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${pts[0]?.x} ${height} ` + d.slice(1) + ` L ${pts[pts.length-1]?.x} ${height} Z`}
        fill={`url(#sg-${color.replace("#","")})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const DonutChart = ({ pct = 0, color = "#5B7FE5", size = 88, stroke = 10 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(91,127,229,0.12)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
};

const MiniLineChart = ({ uploadData = [], salesData = [], labels = [] }) => {
  const allVals = [...uploadData, ...salesData];
  const max = Math.max(...allVals, 1);
  const W = 100, H = 60;
  const pts = (data) => data.map((v, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * W,
    y: H - (v / max) * H * 0.85 + 2,
  }));
  const line = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const up = pts(uploadData.length ? uploadData : [10,20,15,30,25,40,35]);
  const sa = pts(salesData.length ? salesData : [5,8,12,7,18,10,22]);
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path d={line(up)} fill="none" stroke="#5B7FE5" strokeWidth="2" strokeLinecap="round" />
      <path d={line(sa)} fill="none" stroke="#F06B8D" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
    </svg>
  );
};

const MiniCalendar = () => {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const monthName = now.toLocaleString("default", { month: "long" });
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
        <span style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--mc-text)" }}>{monthName}</span>
        <span style={{ fontSize:"0.78rem", color:"var(--mc-text-muted)" }}>{year}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px", textAlign:"center" }}>
        {dayNames.map(d => (
          <div key={d} style={{ fontSize:"0.65rem", color:"var(--mc-text-muted)", fontWeight:600, padding:"2px 0" }}>{d}</div>
        ))}
        {days.map((day, i) => (
          <div key={i} style={{
            fontSize:"0.72rem", padding:"4px 0", borderRadius:"6px",
            background: day === today ? "var(--mc-accent)" : "transparent",
            color: day === today ? "#fff" : day ? "var(--mc-text)" : "transparent",
            fontWeight: day === today ? 700 : 400,
          }}>{day || ""}</div>
        ))}
      </div>
    </div>
  );
};

/* ── Card wrapper ─────────────────────────────────────────────────── */
const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{
    background:"var(--mc-card-bg)", borderRadius:14,
    boxShadow:"var(--mc-card-shadow)", padding:"1rem 1.1rem",
    border:"1px solid var(--mc-border)", ...style,
  }}>
    {children}
  </div>
);

const CardTitle = ({ children, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.9rem" }}>
    <span style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.08em", color:"var(--mc-text-muted)", textTransform:"uppercase" }}>
      {children}
    </span>
    {action}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
const PhotographerDashboard = () => {
  const [stats, setStats] = useState({ totalMedia:0, totalSales:0, totalEarnings:0, pendingEarnings:0, totalViews:0, totalLikes:0 });
  const [recentSales, setRecentSales]   = useState([]);
  const [popularMedia, setPopularMedia] = useState([]);
  const [myMedia, setMyMedia]           = useState([]);
  const [imageUrls, setImageUrls]       = useState({});
  const [loading, setLoading]           = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [thumbIdx, setThumbIdx]         = useState(0);

  const photographerId = getCurrentUserId();
  const storedUser     = getStoredUser();
  const displayName    = getDisplayName(storedUser) || "Photographer";
  const headers        = getAuthHeaders();
  const avatarLetter   = displayName.charAt(0).toUpperCase();

  /* ── fetch ── */
  const fetchDashboardData = useCallback(async () => {
    if (!photographerId) { setLoading(false); return; }
    try {
      setLoading(true);
      const [mediaRes, earningsRes, salesRes, convRes] = await Promise.allSettled([
        axios.get(`${API}/media/mine`, { headers }),
        axios.get(API_ENDPOINTS.PAYMENTS.EARNINGS_SUMMARY(photographerId), { headers }),
        axios.get(API_ENDPOINTS.PAYMENTS.TRANSACTIONS(photographerId), { headers }),
        getConversations(5, 0),
      ]);

      const media = mediaRes.status === "fulfilled"
        ? (Array.isArray(mediaRes.value.data) ? mediaRes.value.data : mediaRes.value.data?.media || [])
        : [];

      const earnings = earningsRes.status === "fulfilled" ? earningsRes.value.data : {};
      const sales    = salesRes.status === "fulfilled"
        ? (Array.isArray(salesRes.value.data) ? salesRes.value.data : [])
        : [];
      const convs = convRes.status === "fulfilled"
        ? (convRes.value.data?.conversations || convRes.value.data || [])
        : [];

      setMyMedia(media);
      setStats({
        totalMedia:    media.length,
        totalSales:    sales.length,
        totalEarnings: earnings?.total || 0,
        pendingEarnings: earnings?.pending || 0,
        totalViews:    media.reduce((s, m) => s + (m.views || 0), 0),
        totalLikes:    media.reduce((s, m) => s + (m.likes || 0), 0),
      });
      setRecentSales(sales.slice(0, 5));
      setPopularMedia([...media].sort((a, b) => (b.likes||0) - (a.likes||0)).slice(0, 5));
      setTransactions(sales);
      setConversations(Array.isArray(convs) ? convs.slice(0, 4) : []);

      /* prefetch protected urls */
      const urls = {};
      await Promise.all(media.slice(0, 10).map(async (item) => {
        const raw = getImageUrl(item, null);
        if (!raw || raw.includes("/opt/")) {
          const id = item._id;
          if (id) { const u = await fetchProtectedUrl(id).catch(() => null); if (u) urls[id] = u; }
        }
      }));
      setImageUrls(urls);
    } catch (e) { console.error("Dashboard error", e); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photographerId]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  /* ── derived ── */
  const sparkUp   = transactions.length ? [3,5,2,8,6,9,transactions.length] : [3,5,2,8,6,9,4];
  const sparkSale = transactions.length ? [1,3,2,5,4,6,transactions.length] : [1,3,2,5,4,6,3];
  const busynessPct = Math.min(99, Math.round((stats.totalSales / Math.max(stats.totalMedia,1)) * 100)) || 42;
  const salesRatioPct = Math.min(99, Math.round((stats.totalSales / Math.max(stats.totalMedia,1)) * 100));
  const mediaUploadedPct = Math.min(99, Math.min(stats.totalMedia * 5, 99));
  const earningsGoalPct = Math.min(99, Math.round(Math.min(stats.totalEarnings / 10000, 1) * 100));

  /* thumbnail carousel */
  const thumbs = myMedia.slice(0, 8);
  const visibleThumbs = thumbs.slice(thumbIdx, thumbIdx + 4);

  /* recent activity items from myMedia */
  const activityItems = myMedia.slice(0, 3).map((m, i) => ({
    icon: i === 0 ? "fa-check-circle" : i === 1 ? "fa-eye" : "fa-comment",
    color: i === 0 ? "#4CC9A6" : i === 1 ? "#5B7FE5" : "#F5A623",
    text: m.title || `Image #${m._id?.slice(-3) || i + 530}`,
    sub: `${m.views || 0} Views · ${i + 1} day ago`,
  }));

  if (loading) {
    return (
      <PhotographerLayout>
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh" }}>
          <div className="spinner-border" style={{ color:"var(--mc-accent)" }}></div>
        </div>
      </PhotographerLayout>
    );
  }

  return (
    <PhotographerLayout>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="mc-hero">
        <div>
          <div className="mc-hero-date">
            <i className="fas fa-calendar-alt me-1"></i>
            {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })}
          </div>
          <h2>Good Day, {displayName}!</h2>
          <p>Have a productive {new Date().toLocaleDateString("en-US", { weekday:"long" })}.</p>
        </div>
        <div className="mc-hero-art" style={{ background:"none" }}>
          {storedUser?.profilePicture ? (
            <img src={storedUser.profilePicture} alt={displayName}
              style={{ width:90, height:90, borderRadius:"50%", objectFit:"cover",
                border:"3px solid rgba(255,255,255,0.3)", boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }} />
          ) : (
            <div style={{ width:90, height:90, borderRadius:"50%", background:"rgba(255,255,255,0.18)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem",
              fontWeight:700, color:"#fff", border:"3px solid rgba(255,255,255,0.3)" }}>
              {avatarLetter}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 1 — 4 stat cards ──────────────────────────────────── */}
      <div className="mc-dash-grid-4">

        {/* MY MEDIA */}
        <Card>
          <CardTitle action={<span style={{ color:"var(--mc-text-muted)", cursor:"pointer", fontSize:"1rem" }}>···</span>}>My Media</CardTitle>
          <div style={{ fontSize:"2rem", fontWeight:700, color:"var(--mc-text)", lineHeight:1 }}>{stats.totalMedia}</div>
          <div style={{ fontSize:"0.75rem", color:"var(--mc-text-muted)", marginBottom:"0.75rem" }}>photos uploaded</div>

          {/* thumbnail strip */}
          {thumbs.length > 0 ? (
            <div>
              <div style={{ display:"flex", gap:"4px", marginBottom:"6px", alignItems:"center" }}>
                <button onClick={() => setThumbIdx(Math.max(0, thumbIdx-1))}
                  style={{ border:"none", background:"rgba(91,127,229,0.1)", borderRadius:"50%", width:20, height:20, cursor:"pointer", color:"var(--mc-accent)", fontSize:"0.6rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div style={{ display:"flex", gap:"4px", flex:1, overflow:"hidden" }}>
                  {visibleThumbs.map((m, i) => {
                    const url = imageUrls[m._id] || getImageUrl(m, placeholderSmall);
                    return (
                      <img key={i} src={url || placeholderSmall} alt=""
                        style={{ width:40, height:34, objectFit:"cover", borderRadius:6, flex:"0 0 auto" }} />
                    );
                  })}
                </div>
                <button onClick={() => setThumbIdx(Math.min(thumbs.length - 4, thumbIdx+1))}
                  style={{ border:"none", background:"rgba(91,127,229,0.1)", borderRadius:"50%", width:20, height:20, cursor:"pointer", color:"var(--mc-accent)", fontSize:"0.6rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <Link to="/photographer/media" style={{ fontSize:"0.72rem", color:"var(--mc-accent)", textDecoration:"none" }}>view all</Link>
            </div>
          ) : (
            <div>
              <Sparkline values={sparkUp} color="#F06B8D" width={120} height={36} />
            </div>
          )}
        </Card>

        {/* TOTAL SALES */}
        <Card>
          <CardTitle action={<span style={{ color:"var(--mc-text-muted)", cursor:"pointer", fontSize:"1rem" }}>···</span>}>Total Sales</CardTitle>
          <div style={{ fontSize:"2rem", fontWeight:700, color:"var(--mc-text)", lineHeight:1 }}>{stats.totalSales}</div>
          <div style={{ fontSize:"0.75rem", color:"var(--mc-text-muted)", marginBottom:"0.75rem" }}>images sold</div>
          <Sparkline values={sparkSale} color="#4CC9A6" width={120} height={40} />
        </Card>

        {/* RECENT MEDIA ACTIVITY */}
        <Card>
          <CardTitle action={<span style={{ color:"var(--mc-text-muted)", cursor:"pointer", fontSize:"1rem" }}>···</span>}>Recent Media Activity</CardTitle>
          {activityItems.length > 0 ? activityItems.map((a, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"0.5rem", marginBottom:"0.55rem" }}>
              <i className={`fas ${a.icon}`} style={{ color:a.color, fontSize:"0.8rem", marginTop:2, flexShrink:0 }}></i>
              <div>
                <div style={{ fontSize:"0.78rem", fontWeight:500, color:"var(--mc-text)" }}>{a.text}</div>
                <div style={{ fontSize:"0.68rem", color:"var(--mc-text-muted)" }}>{a.sub}</div>
              </div>
            </div>
          )) : (
            <div style={{ color:"var(--mc-text-muted)", fontSize:"0.78rem", textAlign:"center", padding:"1rem 0" }}>
              <i className="fas fa-inbox fa-lg mb-2 d-block" style={{ opacity:.3 }}></i>No activity yet
            </div>
          )}
        </Card>

        {/* EARNINGS */}
        <Card>
          <CardTitle action={<span style={{ color:"var(--mc-text-muted)", cursor:"pointer", fontSize:"1rem" }}>···</span>}>Earnings</CardTitle>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:"1.6rem", fontWeight:700, color:"var(--mc-text)", lineHeight:1 }}>
                KES {Number(stats.totalEarnings).toLocaleString()}
              </div>
              <div style={{ fontSize:"0.72rem", color:"var(--mc-text-muted)", marginBottom:"0.75rem" }}>total earned</div>
              {[["Web","#5B7FE5"],["Mobile App","#F06B8D"],["Platform","#4CC9A6"],["Others","#9D7FEB"]].map(([lbl, col]) => (
                <div key={lbl} style={{ display:"flex", justifyContent:"space-between", fontSize:"0.68rem", color:"var(--mc-text-muted)", marginBottom:"2px" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:col, display:"inline-block" }}></span>
                    {lbl}
                  </span>
                  <span style={{ color:"var(--mc-text)", fontWeight:600 }}>KES 0</span>
                </div>
              ))}
            </div>
            <div style={{ position:"relative", flexShrink:0 }}>
              <DonutChart pct={earningsGoalPct || 0} color="#5B7FE5" size={72} stroke={9} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── ROW 2 — 4 cols ────────────────────────────────────────── */}
      <div className="mc-dash-grid-4b">

        {/* MY SCHEDULED EVENTS */}
        <Card>
          <CardTitle>My Scheduled Events</CardTitle>
          <div style={{ display:"flex", alignItems:"center", gap:"0.85rem", marginBottom:"1rem" }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <DonutChart pct={busynessPct} color="#5B7FE5" size={80} stroke={9} />
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.9rem", fontWeight:700, color:"var(--mc-accent)" }}>
                {busynessPct}%
              </div>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--mc-text)" }}>Busyness</div>
              <div style={{ fontSize:"0.68rem", color:"var(--mc-text-muted)" }}>sales / media ratio</div>
            </div>
          </div>
          {[
            { count:stats.totalSales,       label:"Sales",  color:"#F06B8D" },
            { count:stats.totalMedia,       label:"Media",  color:"#4CC9A6" },
            { count:stats.totalViews || 0,  label:"Views",  color:"#9D7FEB" },
          ].map(ev => (
            <div key={ev.label} style={{ display:"flex", alignItems:"center", gap:"0.6rem",
              padding:"0.4rem 0", borderBottom:"1px solid var(--mc-border)" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:ev.color, flexShrink:0 }}></span>
              <span style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--mc-text)", width:28 }}>{ev.count}</span>
              <span style={{ fontSize:"0.75rem", color:"var(--mc-text-muted)", flex:1 }}>{ev.label}</span>
              <span style={{ fontSize:"0.65rem", color:"var(--mc-text-muted)" }}>/ media ratio</span>
            </div>
          ))}
        </Card>

        {/* RECENT SALES */}
        <Card>
          <CardTitle action={<Link to="/photographer/sales" style={{ fontSize:"0.7rem", color:"var(--mc-accent)", textDecoration:"none" }}>view all</Link>}>
            Recent Sales
          </CardTitle>
          {recentSales.length > 0 ? recentSales.slice(0, 4).map((sale, i) => {
            const thumb = imageUrls[sale.mediaId] || getImageUrl(sale, placeholderSmall);
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.6rem",
                padding:"0.45rem 0", borderBottom:"1px solid var(--mc-border)" }}>
                <img src={thumb || placeholderSmall} alt="" onError={e => e.target.src=placeholderSmall}
                  style={{ width:38, height:34, borderRadius:7, objectFit:"cover", flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"0.78rem", fontWeight:500, color:"var(--mc-text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {sale.mediaTitle || sale.description || `Image #${i+522}`}
                  </div>
                  <div style={{ fontSize:"0.67rem", color:"var(--mc-text-muted)" }}>Buyer</div>
                </div>
                <span style={{ fontSize:"0.75rem", fontWeight:600, color:"#4CC9A6", flexShrink:0 }}>
                  KES {Number(sale.amount||0).toLocaleString()}
                </span>
              </div>
            );
          }) : (
            <div style={{ color:"var(--mc-text-muted)", fontSize:"0.78rem", textAlign:"center", padding:"1.5rem 0" }}>
              <i className="fas fa-receipt fa-lg mb-2 d-block" style={{ opacity:.3 }}></i>No sales yet
            </div>
          )}
          {recentSales.length > 0 && (
            <Link to="/photographer/sales" style={{ display:"block", textAlign:"center", marginTop:"0.5rem", fontSize:"0.72rem", color:"var(--mc-accent)", textDecoration:"none" }}>
              view all
            </Link>
          )}
        </Card>

        {/* MY PERFORMANCE */}
        <Card>
          <CardTitle action={
            <div style={{ display:"flex", gap:"0.4rem", alignItems:"center" }}>
              <span style={{ background:"var(--mc-accent)", color:"#fff", fontSize:"0.62rem", fontWeight:700,
                padding:"2px 8px", borderRadius:20 }}>Today</span>
              <button style={{ border:"none", background:"transparent", color:"var(--mc-text-muted)", fontSize:"0.7rem", cursor:"pointer" }}>export</button>
            </div>
          }>My Performance</CardTitle>

          {[
            { label:"Sales Ratio",     pct:salesRatioPct,     color:"#5B7FE5",  sub:"Web / Mobile App" },
            { label:"Media Uploaded",  pct:mediaUploadedPct,  color:"#F06B8D",  sub:"Mobile App" },
            { label:"Earnings Goal",   pct:earningsGoalPct,   color:"#4CC9A6",  sub:`${stats.totalViews||0} views` },
          ].map(row => (
            <div key={row.label} style={{ marginBottom:"0.85rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                <span style={{ fontSize:"0.75rem", color:"var(--mc-text)", fontWeight:500 }}>{row.label}</span>
                <span style={{ fontSize:"0.68rem", color:"var(--mc-text-muted)" }}>{row.sub}</span>
              </div>
              <div style={{ height:6, background:"rgba(91,127,229,0.1)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${row.pct}%`, height:"100%", background:row.color, borderRadius:3, transition:"width 0.6s ease" }}></div>
              </div>
              <div style={{ fontSize:"0.65rem", color:"var(--mc-text-muted)", marginTop:2 }}>{row.pct}%</div>
            </div>
          ))}
          <button style={{ border:"none", background:"transparent", color:"var(--mc-accent)", fontSize:"0.75rem", cursor:"pointer", padding:0 }}>
            + Add goal
          </button>
        </Card>

        {/* ACTIONABLE INSIGHTS */}
        <Card>
          <CardTitle action={<button style={{ border:"none", background:"transparent", color:"var(--mc-text-muted)", fontSize:"0.7rem", cursor:"pointer" }}>export</button>}>
            Actionable Insights
          </CardTitle>
          {/* profile mini */}
          <div style={{ textAlign:"center", marginBottom:"0.85rem" }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--mc-accent)", color:"#fff",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", fontWeight:700,
              margin:"0 auto 0.4rem", overflow:"hidden" }}>
              {storedUser?.profilePicture
                ? <img src={storedUser.profilePicture} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : avatarLetter}
            </div>
            <div style={{ fontWeight:700, fontSize:"0.85rem", color:"var(--mc-text)" }}>{displayName}</div>
            <div style={{ fontSize:"0.62rem", letterSpacing:"0.08em", color:"var(--mc-accent)", fontWeight:600 }}>PHOTOGRAPHER</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.3rem", textAlign:"center", marginBottom:"0.85rem",
            padding:"0.5rem 0", borderTop:"1px solid var(--mc-border)", borderBottom:"1px solid var(--mc-border)" }}>
            {[["Media",stats.totalMedia],["Sales",stats.totalSales],["Views",stats.totalViews||0]].map(([lbl,val]) => (
              <div key={lbl}>
                <div style={{ fontWeight:700, fontSize:"0.9rem", color:"var(--mc-text)" }}>{val}</div>
                <div style={{ fontSize:"0.65rem", color:"var(--mc-text-muted)" }}>{lbl}</div>
              </div>
            ))}
          </div>
          {/* action items */}
          {[
            { icon:"fa-user-check", text:"Complete profile for 15% more views", sub:"Suggestions for recent photos" },
            { icon:"fa-tag",        text:`Add tags to your media`, sub:"Add tags to recent purchase locations" },
          ].map((item, i) => (
            <div key={i} style={{ display:"flex", gap:"0.5rem", marginBottom:"0.5rem" }}>
              <i className={`fas ${item.icon}`} style={{ color:"var(--mc-accent)", fontSize:"0.8rem", marginTop:2, flexShrink:0 }}></i>
              <div>
                <div style={{ fontSize:"0.75rem", fontWeight:500, color:"var(--mc-text)" }}>{item.text}</div>
                <div style={{ fontSize:"0.65rem", color:"var(--mc-text-muted)" }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* ── ROW 3 — chart + top photos + withdrawals + messages + calendar ── */}
      <div className="mc-dash-grid-5">

        {/* Upload / Sale Rate chart */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.6rem" }}>
            <div style={{ display:"flex", gap:"1rem" }}>
              <span style={{ fontSize:"0.72rem", color:"var(--mc-text-muted)", display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:10, height:3, background:"#5B7FE5", display:"inline-block", borderRadius:2 }}></span>
                Upload Rates
              </span>
              <span style={{ fontSize:"0.72rem", color:"var(--mc-text-muted)", display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:10, height:3, background:"#F06B8D", display:"inline-block", borderRadius:2, opacity:.6 }}></span>
                Sale Rate
              </span>
            </div>
          </div>
          <MiniLineChart
            uploadData={sparkUp}
            salesData={sparkSale}
          />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
              <span key={d} style={{ fontSize:"0.6rem", color:"var(--mc-text-muted)" }}>{d}</span>
            ))}
          </div>
        </Card>

        {/* Top Performing Photos */}
        <Card>
          <CardTitle action={<Link to="/photographer/media" style={{ fontSize:"0.7rem", color:"var(--mc-accent)", textDecoration:"none" }}>view all</Link>}>
            Top Performing Photos
          </CardTitle>
          {popularMedia.length > 0 ? popularMedia.slice(0,4).map((m, i) => {
            const url = imageUrls[m._id] || getImageUrl(m, placeholderSmall);
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.6rem",
                padding:"0.35rem 0", borderBottom:"1px solid var(--mc-border)" }}>
                <span style={{ fontWeight:700, fontSize:"0.75rem", color:"var(--mc-text-muted)", width:14 }}>{i+1}</span>
                <img src={url || placeholderSmall} alt="" onError={e => e.target.src=placeholderSmall}
                  style={{ width:34, height:28, objectFit:"cover", borderRadius:6 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"0.76rem", fontWeight:500, color:"var(--mc-text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {m.title || `Image #${m._id?.slice(-3)}`}
                  </div>
                  <div style={{ fontSize:"0.65rem", color:"#4CC9A6", fontWeight:600 }}>
                    KES {Number(m.price || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ color:"var(--mc-text-muted)", fontSize:"0.78rem", textAlign:"center", padding:"1rem 0" }}>
              <i className="fas fa-images fa-lg mb-2 d-block" style={{ opacity:.3 }}></i>No media yet
            </div>
          )}
        </Card>

        {/* Pending Withdrawals & Balances */}
        <Card>
          <CardTitle action={<Link to="/photographer/withdrawals" style={{ fontSize:"0.7rem", color:"var(--mc-accent)", textDecoration:"none" }}>view all</Link>}>
            Pending Withdrawals
          </CardTitle>
          <div style={{ marginBottom:"0.6rem" }}>
            <div style={{ fontSize:"0.68rem", color:"var(--mc-text-muted)", marginBottom:2 }}>Available Balance</div>
            <div style={{ fontSize:"1.2rem", fontWeight:700, color:"#4CC9A6" }}>
              KES {Number(stats.pendingEarnings || 0).toLocaleString()}
            </div>
          </div>
          {transactions.slice(0, 4).map((tx, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"0.4rem 0", borderBottom:"1px solid var(--mc-border)", fontSize:"0.73rem" }}>
              <div>
                <div style={{ color:"var(--mc-text)", fontWeight:500 }}>Transaction</div>
                <div style={{ color:"var(--mc-text-muted)", fontSize:"0.65rem" }}>Transaction History</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:"#4CC9A6", fontWeight:600 }}>KES {Number(tx.amount||0).toLocaleString()}</div>
                <div style={{ color:"var(--mc-text-muted)", fontSize:"0.62rem" }}>
                  {new Date(tx.createdAt||tx.date||Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div style={{ color:"var(--mc-text-muted)", fontSize:"0.75rem", textAlign:"center", padding:"0.8rem 0" }}>
              No transactions yet
            </div>
          )}
        </Card>

        {/* Messages */}
        <Card>
          <CardTitle action={<Link to="/messages" style={{ fontSize:"0.7rem", color:"var(--mc-accent)", textDecoration:"none" }}>
            <i className="fas fa-expand-alt"></i>
          </Link>}>Messages</CardTitle>
          {conversations.length > 0 ? conversations.map((conv, i) => {
            const other = conv.otherUser || conv.participants?.find(p => p._id !== photographerId) || {};
            const letter = (other.username || "U").charAt(0).toUpperCase();
            return (
              <div key={i} style={{ display:"flex", gap:"0.55rem", alignItems:"flex-start",
                padding:"0.4rem 0", borderBottom:"1px solid var(--mc-border)" }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:"var(--mc-accent)",
                  color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.75rem", fontWeight:700, flexShrink:0, overflow:"hidden" }}>
                  {other.profilePicture
                    ? <img src={other.profilePicture} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : letter}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--mc-text)" }}>{other.username || "User"}</span>
                    <span style={{ fontSize:"0.6rem", color:"var(--mc-text-muted)" }}>1d</span>
                  </div>
                  <div style={{ fontSize:"0.68rem", color:"var(--mc-text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {conv.lastMessage?.content || conv.lastMessage || "No messages yet"}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ color:"var(--mc-text-muted)", fontSize:"0.75rem", textAlign:"center", padding:"1rem 0" }}>
              <i className="fas fa-comments fa-lg mb-2 d-block" style={{ opacity:.3 }}></i>No messages
            </div>
          )}
          <Link to="/messages" style={{ display:"block", textAlign:"center", marginTop:"0.5rem",
            fontSize:"0.72rem", color:"var(--mc-accent)", textDecoration:"none" }}>
            Open inbox
          </Link>
        </Card>

        {/* Mini Calendar */}
        <Card>
          <MiniCalendar />
        </Card>
      </div>

    </PhotographerLayout>
  );
};

export default PhotographerDashboard;
