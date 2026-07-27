/* ============================================================
   Passes clone — interactions & scroll animations
   Pure CSS transitions toggled by a plain rAF scroll loop.
   No external lib, no dependency on OS motion settings — so it
   plays reliably in every browser. Effects: scroll-scrubbed
   heading reveals, fade-up reveals, staggered grids, parallax,
   count-ups, hero load-in, chat sequence.
   ============================================================ */
(function () {
  "use strict";

  var clamp = function (min, max, v) { return Math.min(max, Math.max(min, v)); };
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* ============ NON-ANIMATION UI ============ */

  /* nav bg on scroll + sticky mobile CTA reveal */
  var nav = document.getElementById("nav");
  var mobileCta = document.getElementById("mobileCta");
  var heroEl = document.querySelector(".hero");
  function navScroll() {
    if (window.scrollY > 20) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
    if (mobileCta) {
      var trigger = heroEl ? heroEl.offsetHeight * 0.6 : 500;
      var show = window.scrollY > trigger && !document.getElementById("mobileMenu").classList.contains("open");
      mobileCta.classList.toggle("show", show);
    }
  }
  window.addEventListener("scroll", navScroll, { passive: true });
  navScroll();

  /* mobile menu */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      nav.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-label", open ? "close menu" : "menu");
      if (open && mobileCta) mobileCta.classList.remove("show");
      else navScroll();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("open"); nav.classList.remove("menu-open"); navScroll(); });
    });
  }

  /* theme toggle */
  var themeBtn = document.getElementById("themeToggle");
  var sun = document.getElementById("sunIcon");
  themeBtn.addEventListener("click", function () {
    var html = document.documentElement;
    var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    sun.innerHTML = next === "dark"
      ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
      : '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>';
  });

  /* hero carousel */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".carousel-slide"));
  var ccTag = document.getElementById("ccTag");
  var ccPrice = document.getElementById("ccPrice");
  var ccName = document.getElementById("ccName");
  var ccHandle = document.getElementById("ccHandle");
  var ccImg = document.getElementById("ccImg");
  var ci = 0;
  function showSlide(i) {
    slides.forEach(function (s, k) { s.classList.toggle("active", k === i); });
    var d = slides[i].dataset;
    ccTag.textContent = d.tag; ccPrice.textContent = d.price;
    ccName.textContent = d.name; ccHandle.textContent = d.handle;
    ccImg.src = slides[i].querySelector("img").src;
  }
  if (slides.length) { showSlide(0); setInterval(function () { ci = (ci + 1) % slides.length; showSlide(ci); }, 3800); }

  /* smart scheduler calendar */
  var calGrid = document.getElementById("calGrid");
  if (calGrid) {
    var on = { 3: 1, 7: 1, 12: 1, 18: 1, 21: 1, 26: 1 };
    for (var dd = 1; dd <= 28; dd++) { var c = document.createElement("i"); if (on[dd]) c.className = "on"; calGrid.appendChild(c); }
  }

  /* earnings calculator */
  var fans = document.getElementById("fans"), price = document.getElementById("price");
  var fansVal = document.getElementById("fansVal"), priceVal = document.getElementById("priceVal");
  var monthly = document.getElementById("monthly"), yearly = document.getElementById("yearly");
  function fmt(n) { return "₹" + Math.round(n).toLocaleString("en-US"); }
  function calc() {
    // est. monthly commission = audience x avg order value x (8% monthly conversion x 20% commission)
    var f = +fans.value, p = +price.value, m = f * p * 0.016;
    fansVal.value = f.toLocaleString("en-US"); priceVal.value = p.toLocaleString("en-US");
    tweenNum(monthly, m); tweenNum(yearly, m * 12);
  }
  function tweenNum(el, target) {
    var start = parseFloat((el.textContent || "0").replace(/[^0-9.]/g, "")) || 0;
    var t0 = null, dur = 450;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min((ts - t0) / dur, 1), e = easeOutCubic(k);
      el.textContent = fmt(start + (target - start) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (fans && price) { fans.addEventListener("input", calc); price.addEventListener("input", calc); calc(); }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q"), a = item.querySelector(".faq-a");
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(function (o) {
        o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!open) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ============ SCROLL ANIMATIONS ============ */

  /* word splitter — preserves gradient (.grad-text) spans, sets --i per word */
  function splitWords(el) {
    var frag = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (tok) {
          if (tok === "") return;
          if (/^\s+$/.test(tok)) { frag.push(document.createTextNode(tok)); return; }
          var s = document.createElement("span"); s.className = "w"; s.textContent = tok; frag.push(s);
        });
      } else if (node.nodeType === 1 && node.tagName === "BR") {
        frag.push(node.cloneNode());
      } else if (node.nodeType === 1) {
        var cls = node.getAttribute("class") || "";
        node.textContent.split(/(\s+)/).forEach(function (tok) {
          if (tok === "") return;
          if (/^\s+$/.test(tok)) { frag.push(document.createTextNode(tok)); return; }
          var s = document.createElement("span"); s.className = ("w " + cls).trim(); s.textContent = tok; frag.push(s);
        });
      }
    });
    el.innerHTML = "";
    frag.forEach(function (n) { el.appendChild(n); });
    var words = Array.prototype.slice.call(el.querySelectorAll(".w"));
    words.forEach(function (w, i) { w.style.setProperty("--i", i); });
    return words;
  }

  /* live earnings feed (Real-Time Earnings panel) — stacked notifications
     that cycle, matching passes.com (top step 62px, opacity/scale falloff,
     easeOutBack easing handled in CSS) */
  var feed = document.getElementById("earnFeed");
  if (feed) {
    var pool = [
      { t: "Affiliate Sale", s: "Glow serum", a: "+₹450" },
      { t: "New Order", s: "via your link", a: "+₹820" },
      { t: "Brand Collab", s: "Sunscreen launch", a: "+₹2,500" },
      { t: "Commission Paid", s: "Monthly payout", a: "+₹6,400" },
      { t: "Referral Bonus", s: "New creator joined", a: "+₹1,200" },
      { t: "Bundle Sold", s: "K-beauty set", a: "+₹1,850" }
    ];
    var coin = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
    var rows = [], pi = 0;
    function makeRow(d) {
      var el = document.createElement("div");
      el.className = "feed-item";
      el.innerHTML = '<div class="fi-ic">' + coin + '</div><div class="fi-main"><b>' + d.t + '</b><span>' + d.s + '</span></div><div class="fi-amt">' + d.a + '</div>';
      return el;
    }
    function layout() {
      rows.forEach(function (el, idx) {
        el.style.top = (idx * 62) + "px";
        el.style.opacity = Math.max(0, 1 - idx * 0.2);
        el.style.transform = "scale(" + (1 - idx * 0.02) + ")";
        el.style.zIndex = 20 - idx;
      });
    }
    function pushNew() {
      var d = pool[pi % pool.length]; pi++;
      var el = makeRow(d);
      el.style.top = "-58px"; el.style.opacity = "0"; el.style.transform = "scale(.94)";
      feed.appendChild(el); rows.unshift(el);
      void el.offsetHeight; // reflow so the transition runs
      layout();
      if (rows.length > 5) {
        var old = rows.pop();
        old.style.opacity = "0"; old.style.top = (5 * 62) + "px";
        setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 520);
      }
    }
    for (var fk = 0; fk < 4; fk++) { var fe = makeRow(pool[fk]); feed.appendChild(fe); rows.push(fe); }
    pi = 4; layout();
    setInterval(pushNew, 2300);
  }

  /* parallax (scroll-linked, no transform conflicts with idle animations) */
  var parItems = [];
  function addParallax(sel, fn) { var el = document.querySelector(sel); if (el) parItems.push({ el: el, fn: fn }); }
  addParallax(".hero-glow", function (el, y) {
    el.style.transform = "translateX(-50%) translateY(" + y * 0.28 + "px)";
    el.style.opacity = clamp(0, 1, 1 - y / 650);
  });
  addParallax(".hero-stage", function (el, y) {
    if (window.innerWidth <= 720) { el.style.transform = ""; return; } // no 3D tilt on mobile
    var tilt = 18 * clamp(0, 1, 1 - y / 520);   // rotateX 18deg -> 0 as you scroll
    el.style.transform = "translateY(" + (-y * 0.04) + "px) rotateX(" + tilt + "deg)";
  });
  addParallax(".earn-chip", function (el, y, vh) {
    var r = el.getBoundingClientRect();
    el.style.transform = "translateY(" + ((r.top + r.height / 2 - vh / 2) / vh * -36) + "px)";
  });

  /* entrance triggers — fire by scroll position (robust to anchor jumps / fast scroll) */
  var triggers = [];
  function onEnter(el, fn, th) { triggers.push({ el: el, fn: fn, done: false, th: th == null ? 0.9 : th }); }

  // reveals
  document.querySelectorAll(".reveal").forEach(function (el) {
    onEnter(el, function () { el.classList.add("in"); }, 0.92);
  });
  // staggered grids (set --i per child for delay)
  document.querySelectorAll(".reveal-stagger").forEach(function (grid) {
    Array.prototype.slice.call(grid.children).forEach(function (k, i) { k.style.setProperty("--i", i); });
    onEnter(grid, function () { grid.classList.add("in"); }, 0.95);
  });
  // count-ups
  function countUp(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || "", t0 = null, dur = 1500;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min((ts - t0) / dur, 1), e = easeOutCubic(k);
      el.textContent = Math.round(target * e).toLocaleString("en-US") + suffix;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var isHero = el.closest(".hero");
    onEnter(el, function () { countUp(el); }, isHero ? 1.2 : 0.85);
  });
  // revenue chart draw
  var chartCard = document.getElementById("chartCard");
  if (chartCard) onEnter(chartCard, function () { chartCard.classList.add("reveal-chart"); }, 0.78);
  // chat sequence (set --i on each animated piece)
  var device = document.querySelector(".device");
  if (device) {
    Array.prototype.slice.call(device.querySelectorAll(".anim")).forEach(function (b, i) { b.style.setProperty("--i", i); });
    onEnter(device, function () { device.classList.add("in"); }, 0.82);
  }

  /* the scroll loop */
  /* industry: two rows cross-scroll horizontally (opposite directions) */
  var indRow1 = document.getElementById("indRow1");
  var indRow2 = document.getElementById("indRow2");
  var industry = document.getElementById("industry");

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight, vw = window.innerWidth, y = window.scrollY;
    // parallax
    for (var k = 0; k < parItems.length; k++) parItems[k].fn(parItems[k].el, y, vh);
    // industry horizontal cross-scroll
    if (indRow1 && industry) {
      var sec = industry.getBoundingClientRect();
      var p = clamp(0, 1, (vh - sec.top) / (vh + sec.height)); // 0 entering -> 1 leaving
      var drift = vw <= 720 ? 70 : 150;
      var c1 = (vw - indRow1.scrollWidth) / 2;
      var c2 = (vw - indRow2.scrollWidth) / 2;
      indRow1.style.transform = "translateX(" + (c1 + (0.5 - p) * drift * 2) + "px)";
      indRow2.style.transform = "translateX(" + (c2 - (0.5 - p) * drift * 2) + "px)";
    }
    // entrance triggers
    for (var ti = 0; ti < triggers.length; ti++) {
      var tg = triggers[ti];
      if (tg.done) continue;
      if (tg.el.getBoundingClientRect().top < vh * tg.th) { tg.done = true; tg.fn(); }
    }
  }
  function onScrollRaf() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScrollRaf, { passive: true });
  window.addEventListener("resize", onScrollRaf, { passive: true });
  window.addEventListener("load", update);

  /* hero load-in */
  var heroH = document.querySelector("[data-hero]");
  if (heroH) splitWords(heroH);
  document.querySelectorAll(".hero .eyebrow, .hero .lead, .hero .btn-white, .hero .carousel-card, .hero .float-card")
    .forEach(function (el, i) { el.classList.add("hero-bit"); el.style.setProperty("--i", i); });
  // kick load-in + first paint of scrub/parallax on next frame
  requestAnimationFrame(function () {
    update();
    requestAnimationFrame(function () { document.documentElement.classList.add("hero-in"); });
  });

  window.__tick = update; // test hook
})();
