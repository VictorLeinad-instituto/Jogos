// Antes ficava embutido em index.html; separado para a política de segurança (CSP) não precisar liberar scripts embutidos.
/* celular em pé: os ícones da barra viram um menu (3 barras) com o nome de cada ação (como no Tuto e a jornada) */
(function () {
  var tb = document.getElementById("topbar"), m = document.getElementById("topActions");
  var b = document.getElementById("menuBtn");
  if (!b || !m) return;
  var ultimo = 0;
  function fechar() { document.body.classList.remove("menu-aberto"); if (b) b.setAttribute("aria-expanded", "false"); }
  function alternar() { var a = document.body.classList.toggle("menu-aberto"); b.setAttribute("aria-expanded", String(a)); }
  function ligar() {
    b.addEventListener("pointerup", function (e) { if (e.pointerType === "mouse") return; ultimo = Date.now(); e.stopPropagation(); alternar(); });
    b.addEventListener("click", function (e) { e.stopPropagation(); if (Date.now() - ultimo < 700) return; alternar(); });
  }
  ligar();
  document.addEventListener("click", function (e) {
    if (b.contains(e.target)) return;
    if (!m.contains(e.target)) fechar(); else if (e.target.closest(".icon-btn")) setTimeout(fechar, 0);
  });
  function renovar() {
    var aberto = document.body.classList.contains("menu-aberto");
    var novo = b.cloneNode(true);
    b.parentNode.replaceChild(novo, b);
    b = novo; ligar();
    b.setAttribute("aria-expanded", String(aberto));
    if (tb) { tb.style.transform = "translateZ(0)"; void tb.offsetHeight; setTimeout(function () { tb.style.transform = ""; }, 60); }
  }
  var larg = window.innerWidth;
  function compacto() {
    var c = window.innerWidth <= 640 && window.innerHeight > window.innerWidth;
    document.body.classList.toggle("menu-compacto", c);
    if (!c) fechar();
  }
  function girou() {
    var mudou = window.innerWidth !== larg;
    if (mudou) { larg = window.innerWidth; fechar(); }
    compacto();
    if (mudou) renovar();
  }
  compacto();
  window.addEventListener("resize", girou);
  window.addEventListener("orientationchange", function () { setTimeout(girou, 120); setTimeout(girou, 600); setTimeout(renovar, 700); });
  if (window.matchMedia) { var mq = window.matchMedia("(orientation: portrait)"); (mq.addEventListener ? mq.addEventListener("change", function () { setTimeout(girou, 100); }) : mq.addListener(function () { setTimeout(girou, 100); })); }
})();
