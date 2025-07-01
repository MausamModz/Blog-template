(function () {
  const url = "https://raw.githubusercontent.com/anaroulhasan/themestash/refs/heads/main/icons/huge.json";
  fetch(url).then(r => r.json()).then(d => {
    document.querySelectorAll("icon").forEach(e => {
      const n = e.getAttribute("name");
      if (d[n]) e.innerHTML = d[n];
    });
  });
})();
