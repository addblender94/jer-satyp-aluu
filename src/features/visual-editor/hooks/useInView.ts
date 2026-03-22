import { useState, useEffect, useRef, RefObject } from 'react'

export interface UseInViewOptions {
  rootMargin?: string
  threshold?: number | number[]
  root?: RefObject<Element> | null
}

export function useInView(
  ref: RefObject<Element>,
  options: UseInViewOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    }, {
      root: options.root?.current || null,
      rootMargin: options.rootMargin || '500px', // Large buffer for smooth scroll
      threshold: options.threshold || 0
    })

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref, options.root, options.rootMargin, options.threshold])

  return isInView
}
