/**
 * Scroll-triggered animation utility.
 * Adds 'animate-fade-in' class when elements enter the viewport.
 */

export function initScrollAnimations(): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  const elements = document.querySelectorAll('[data-animate]')
  elements.forEach((el) => observer.observe(el))

  return () => observer.disconnect()
}