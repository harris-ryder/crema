export function installIOSViewportPolyfill() {
  const vv = window.visualViewport;
  if (!vv) return;

  const setVars = () => {
    document.documentElement.style.setProperty("--app-height", `${vv.height}px`);
  };

  let raf = 0;
  const onChange = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(setVars);
  };

  vv.addEventListener("resize", onChange);
  vv.addEventListener("scroll", onChange);
  window.addEventListener("orientationchange", onChange);
  window.addEventListener("focusin", onChange);
  window.addEventListener("focusout", () => {
    setTimeout(onChange, 50);
    setTimeout(onChange, 250);
  });

  setVars();
}
