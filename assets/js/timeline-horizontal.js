/**
 * FRISE CHRONOLOGIQUE HORIZONTALE
 * Animation au scroll et interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    const timelineItems = document.querySelectorAll('.timeline-horizontal-item');
    const timelineWrapper = document.querySelector('.timeline-horizontal-wrapper');

    if (!timelineItems.length) {
        console.warn('Timeline items not found');
        return;
    }

    // Options pour l'Intersection Observer
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    // Callback de l'observer
    const observerCallback = (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Trouver l'index de l'élément dans la liste
                const index = Array.from(timelineItems).indexOf(entry.target);

                // Ajouter un délai progressif pour chaque élément
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, index * 150); // 150ms de délai entre chaque élément
            }
        });
    };

    // Créer l'observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observer chaque élément de la timeline
    timelineItems.forEach((item) => {
        observer.observe(item);
    });
});
