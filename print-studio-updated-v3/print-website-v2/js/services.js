const serviceSearch = document.querySelector('#serviceSearch');

if (serviceSearch) {
  const serviceCards = [...document.querySelectorAll('.category-card[data-search]')];
  const emptyMessage = document.querySelector('#serviceSearchEmpty');

  serviceSearch.addEventListener('input', () => {
    const query = serviceSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    serviceCards.forEach(card => {
      const matches = card.dataset.search.includes(query) || card.textContent.toLowerCase().includes(query);
      card.hidden = !matches;
      visibleCount += matches ? 1 : 0;
    });

    emptyMessage.hidden = visibleCount > 0;
  });
}