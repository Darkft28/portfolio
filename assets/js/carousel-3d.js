/**
 * CARROUSEL 3D - EFFET CARTES EN MAIN
 * Rotation rythmée avec effet de profondeur
 */

document.addEventListener('DOMContentLoaded', function() {

    // Configuration
    const CONFIG = {
        autoPlayDelay: 4000,        // Délai entre chaque rotation automatique
        transitionDuration: 800,    // Durée de la transition en ms
        pauseOnHover: true,         // Pause l'auto-play au survol
        keyboardNavigation: true    // Active la navigation au clavier
    };

    // Classe principale du carrousel
    class Carousel3D {
        constructor(containerSelector) {
            this.container = document.querySelector(containerSelector);
            if (!this.container) {
                console.warn('Carousel container not found');
                return;
            }

            // Les indicateurs sont dans la section parente, pas dans le container
            const section = this.container.closest('#projects');

            this.track = this.container.querySelector('.carousel-track');
            this.cards = Array.from(this.container.querySelectorAll('.project-card'));
            this.indicators = Array.from(section ? section.querySelectorAll('.carousel-indicator') : []);
            this.prevBtn = this.container.querySelector('.carousel-btn-prev');
            this.nextBtn = this.container.querySelector('.carousel-btn-next');

            this.currentIndex = 0;
            this.totalCards = this.cards.length;
            this.isTransitioning = false;
            this.autoPlayTimer = null;
            this.isHovered = false;

            if (this.totalCards === 0) {
                console.warn('No cards found in carousel');
                return;
            }

            this.init();
        }

        /**
         * Initialisation du carrousel
         */
        init() {
            // Ajouter les index aux cartes
            this.cards.forEach((card, index) => {
                card.dataset.index = index;
            });

            // Configuration initiale
            this.updateCarousel(false);

            // Événements des boutons
            this.setupControls();

            // Navigation au clavier
            if (CONFIG.keyboardNavigation) {
                this.setupKeyboardNavigation();
            }

            // Auto-play
            this.startAutoPlay();

            // Pause au survol
            if (CONFIG.pauseOnHover) {
                this.setupHoverPause();
            }

            // Click sur les cartes latérales pour naviguer
            this.setupCardClick();
        }

        /**
         * Calcule l'index circulaire (pour le carrousel infini)
         */
        getCircularIndex(index) {
            return ((index % this.totalCards) + this.totalCards) % this.totalCards;
        }

        /**
         * Met à jour l'affichage du carrousel
         */
        updateCarousel(animated = true) {
            // Si pas d'animation, désactiver temporairement les transitions
            if (!animated) {
                this.cards.forEach(card => {
                    card.style.transition = 'none';
                });
            }

            // Calculer les positions
            const leftIndex = this.getCircularIndex(this.currentIndex - 1);
            const centerIndex = this.currentIndex;
            const rightIndex = this.getCircularIndex(this.currentIndex + 1);

            // Appliquer les positions à toutes les cartes
            this.cards.forEach((card, index) => {
                // Retirer toutes les positions
                card.removeAttribute('data-position');

                // Appliquer la nouvelle position
                if (index === centerIndex) {
                    card.setAttribute('data-position', 'center');
                } else if (index === leftIndex) {
                    card.setAttribute('data-position', 'left');
                } else if (index === rightIndex) {
                    card.setAttribute('data-position', 'right');
                } else {
                    card.setAttribute('data-position', 'hidden');
                }
            });

            // Réactiver les transitions
            if (!animated) {
                setTimeout(() => {
                    this.cards.forEach(card => {
                        card.style.transition = '';
                    });
                }, 50);
            }

            // Mettre à jour les indicateurs
            this.updateIndicators();
        }

        /**
         * Navigation vers la carte suivante
         */
        next() {
            if (this.isTransitioning) return;

            this.isTransitioning = true;
            this.currentIndex = this.getCircularIndex(this.currentIndex + 1);
            this.updateCarousel(true);

            setTimeout(() => {
                this.isTransitioning = false;
            }, CONFIG.transitionDuration);

            // Effet sonore visuel (petite animation sur le bouton)
            this.animateButton(this.nextBtn);
        }

        /**
         * Navigation vers la carte précédente
         */
        prev() {
            if (this.isTransitioning) return;

            this.isTransitioning = true;
            this.currentIndex = this.getCircularIndex(this.currentIndex - 1);
            this.updateCarousel(true);

            setTimeout(() => {
                this.isTransitioning = false;
            }, CONFIG.transitionDuration);

            // Effet sonore visuel (petite animation sur le bouton)
            this.animateButton(this.prevBtn);
        }

        /**
         * Aller directement à une carte spécifique
         */
        goTo(index) {
            if (this.isTransitioning) {
                return;
            }

            if (index === this.currentIndex) {
                return;
            }

            this.isTransitioning = true;
            this.currentIndex = this.getCircularIndex(index);
            this.updateCarousel(true);

            setTimeout(() => {
                this.isTransitioning = false;
            }, CONFIG.transitionDuration);

            this.resetAutoPlay();
        }

        /**
         * Met à jour les indicateurs de pagination
         */
        updateIndicators() {
            this.indicators.forEach((indicator, index) => {
                if (index === this.currentIndex) {
                    indicator.classList.add('active');
                    indicator.setAttribute('aria-current', 'true');
                } else {
                    indicator.classList.remove('active');
                    indicator.removeAttribute('aria-current');
                }
            });
        }

        /**
         * Configuration des contrôles (boutons et indicateurs)
         */
        setupControls() {
            // Bouton précédent
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.prev();
                    this.resetAutoPlay();
                });
            }

            // Bouton suivant
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.next();
                    this.resetAutoPlay();
                });
            }

            // Indicateurs
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    this.goTo(index);
                });

                // Accessibilité
                indicator.setAttribute('role', 'button');
                indicator.setAttribute('aria-label', `Aller au projet ${index + 1}`);
                indicator.setAttribute('tabindex', '0');
            });
        }

        /**
         * Navigation au clavier
         */
        setupKeyboardNavigation() {
            document.addEventListener('keydown', (e) => {
                // Vérifier si le carrousel est visible
                const rect = this.container.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                if (!isVisible) return;

                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prev();
                    this.resetAutoPlay();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.next();
                    this.resetAutoPlay();
                }
            });
        }

        /**
         * Click sur les cartes latérales pour naviguer
         */
        setupCardClick() {
            this.cards.forEach(card => {
                card.addEventListener('click', () => {
                    const position = card.getAttribute('data-position');

                    if (position === 'left') {
                        this.prev();
                        this.resetAutoPlay();
                    } else if (position === 'right') {
                        this.next();
                        this.resetAutoPlay();
                    }
                    // Si c'est la carte centrale, ne rien faire (laisser les liens fonctionner)
                });
            });
        }

        /**
         * Démarrer l'auto-play
         */
        startAutoPlay() {
            this.stopAutoPlay();
            this.autoPlayTimer = setInterval(() => {
                if (!this.isHovered) {
                    this.next();
                }
            }, CONFIG.autoPlayDelay);
        }

        /**
         * Arrêter l'auto-play
         */
        stopAutoPlay() {
            if (this.autoPlayTimer) {
                clearInterval(this.autoPlayTimer);
                this.autoPlayTimer = null;
            }
        }

        /**
         * Redémarrer l'auto-play (après une interaction)
         */
        resetAutoPlay() {
            this.stopAutoPlay();
            this.startAutoPlay();
        }

        /**
         * Pause au survol du carrousel
         */
        setupHoverPause() {
            this.container.addEventListener('mouseenter', () => {
                this.isHovered = true;
            });

            this.container.addEventListener('mouseleave', () => {
                this.isHovered = false;
            });
        }

        /**
         * Animation visuelle du bouton cliqué
         */
        animateButton(button) {
            if (!button) return;

            button.style.transform = 'translateY(-50%) scale(0.9)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }

        /**
         * Détruire le carrousel (cleanup)
         */
        destroy() {
            this.stopAutoPlay();
            // Retirer tous les event listeners si nécessaire
        }
    }

    // Initialiser le carrousel
    const carousel = new Carousel3D('.carousel-container');

    // Exposer l'instance pour debug
    window.carousel3D = carousel;

    // Gestion du redimensionnement de la fenêtre
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (carousel) {
                carousel.updateCarousel(false);
            }
        }, 250);
    });
});
