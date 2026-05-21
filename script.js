const ticker = document.querySelector("[data-ticker]");

const analyticsConfig = {
  supabaseUrl: "https://llarwagbefhnrpnmrvfu.supabase.co",
  publishableKey: "sb_publishable_JnYet_YLK1WM4MJaQGTN3A_KVLhdTWf"
};

const getDeviceType = () => {
  const userAgent = navigator.userAgent || "";
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  return isMobile ? "mobile" : "desktop";
};

const getOperatingSystem = () => {
  const userAgent = navigator.userAgent || "";

  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Other";
};

const getReturningVisitorStatus = () => {
  const storageKey = "sc23_returning_visitor";
  const hasVisited = localStorage.getItem(storageKey) === "1";
  localStorage.setItem(storageKey, "1");
  return hasVisited;
};

const returningVisitor = getReturningVisitorStatus();
let visitorLocationPromise;

const getVisitorLocation = () => {
  if (!visitorLocationPromise) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);

    visitorLocationPromise = fetch("https://ipapi.co/json/", {
      signal: controller.signal,
      cache: "no-store"
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data || data.error) return {};
        return {
          ip_address: data.ip || null,
          city: data.city || null,
          region: data.region || null,
          country: data.country_name || null,
          country_code: data.country_code || null,
          timezone: data.timezone || null,
          latitude: typeof data.latitude === "number" ? data.latitude : null,
          longitude: typeof data.longitude === "number" ? data.longitude : null
        };
      })
      .catch(() => ({}))
      .finally(() => window.clearTimeout(timeout));
  }

  return visitorLocationPromise;
};

const postSiteEvent = (payload) => {
  const endpoint = `${analyticsConfig.supabaseUrl}/rest/v1/site_events`;

  return fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: analyticsConfig.publishableKey,
      Authorization: `Bearer ${analyticsConfig.publishableKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(payload),
    keepalive: true
  });
};

const buildBaseEventPayload = (eventType) => ({
  event_type: eventType,
  page: window.location.href,
  user_agent: navigator.userAgent,
  device_type: getDeviceType(),
  operating_system: getOperatingSystem(),
  returning_visitor: returningVisitor
});

const recordSiteEvent = (eventType) => {
  if (!analyticsConfig.supabaseUrl || !analyticsConfig.publishableKey) {
    return;
  }

  const basePayload = buildBaseEventPayload(eventType);

  getVisitorLocation()
    .then((location) => postSiteEvent({ ...basePayload, ...location }))
    .then((response) => {
      if (!response.ok) {
        return postSiteEvent(basePayload);
      }
      return null;
    })
    .catch(() => {
      postSiteEvent(basePayload).catch(() => {});
    });
};

recordSiteEvent("page_view");

if (ticker) {
  ticker.innerHTML += ticker.innerHTML;
}

const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));

if (heroSlides.length > 1) {
  let currentSlide = 0;
  setInterval(() => {
    const leavingSlide = heroSlides[currentSlide];
    leavingSlide.classList.remove("active");
    leavingSlide.classList.add("leaving");
    currentSlide = (currentSlide + 1) % heroSlides.length;
    heroSlides[currentSlide].classList.add("active");
    window.setTimeout(() => {
      leavingSlide.classList.remove("leaving");
    }, 1000);
  }, 4200);
}

const profileSlides = Array.from(document.querySelectorAll(".profile-slide"));

if (profileSlides.length > 1) {
  let currentProfileSlide = 0;
  setInterval(() => {
    const leavingSlide = profileSlides[currentProfileSlide];
    leavingSlide.classList.remove("active");
    leavingSlide.classList.add("leaving");
    currentProfileSlide = (currentProfileSlide + 1) % profileSlides.length;
    profileSlides[currentProfileSlide].classList.add("active");
    window.setTimeout(() => {
      leavingSlide.classList.remove("leaving");
    }, 950);
  }, 3600);
}

document.querySelectorAll(".command-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    chip.animate(
      [
        { transform: "translateY(-2px) scale(1)" },
        { transform: "translateY(-2px) scale(1.025)" },
        { transform: "translateY(-2px) scale(1)" }
      ],
      { duration: 260, easing: "ease-out" }
    );
  });
});

document.querySelectorAll('a[href*="SC23_Harita."]').forEach((link) => {
  link.addEventListener("click", () => {
    recordSiteEvent("download_click");
  });
});
