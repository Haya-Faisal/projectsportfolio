const pieces = [
  {
    url: "bookflix.html",
    title: "Bookflix",
  },
  {
    url: "tessera.html",
    title: "Tessera",
  },
  {
    url: "rantitout.html",
    title: "Rant It Out",
  },

  {
    url: "friendsandfoes.html",
    title: "Friends and Foes",
  },

  {
    url: "chorus.html",
    title: "One Chorus bot",
  },

  {
    url: "https://pureinformation.stream/",
    title: "Pure Information",
  },
  
  
];

window.onload = () => {
  const root = document.querySelector(":root");
  root.style.setProperty(
    "--vh",
    Math.min(640, Math.floor(window.innerHeight * 0.85)) + "px"
  );

  handleScroll();
};

window.onscroll = () => handleScroll();

function handleScroll() {
  if (window.innerWidth > 800) {
    const root = document.querySelector(":root");
    root.style.setProperty("--scroll", Math.floor(window.scrollY) + "px");

    root.style.setProperty(
      "--visible",
      (Math.floor(window.scrollY - 17000) / -100).toFixed(1)
    );
    let active = null;
    const link = document.querySelector("#link");

    if (window.scrollY > 1100) {
      pieces.forEach((d, i) => {
        const z = 1200 + i * 1000;

        if (z - window.scrollY > -1680 && !active) {
          active = d;
          link.innerHTML = d.title + "&nbsp;&#8674;";
          link.setAttribute("href", d.url);
          link.style.display = "block";
        }
      });
    }

    if (!active) {
      link.style.display = "none";
      link.innerHTML = null;
    }
  }
}