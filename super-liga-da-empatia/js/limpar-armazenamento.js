// Saiu do jogo, nada fica salvo (LGPD): o jogo usa só a sessão (sessionStorage).
// Apaga o que versões antigas deixaram no localStorage deste computador. Gerado por ferramentas/seguranca/aplicar-sessao.js.
(function () {
  var prefixos = ["asm-liga-"];
  try {
    Object.keys(localStorage).forEach(function (k) {
      if (prefixos.some(function (p) { return k.indexOf(p) === 0; })) localStorage.removeItem(k);
    });
  } catch (e) { /* sem armazenamento */ }
})();
