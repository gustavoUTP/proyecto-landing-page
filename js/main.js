        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'flex';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        document.querySelectorAll('.reveal').forEach(modal => {
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    closeModal(modal.id);
                }
            });
        });


  // Toggle menú móvil
  const btn = document.getElementById('menu-btn');
  const menuMobile = document.getElementById('menu-mobile');

  btn.addEventListener('click', () => {
    menuMobile.classList.toggle('hidden');
  });
      
