const destination = document.querySelector('[data-redirect]');
if (destination) window.location.replace(destination.href + window.location.search + window.location.hash);
