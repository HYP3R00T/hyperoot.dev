export function getReadingTime(text: string, wpm: number = 225) {
  const words = text.trim().split(/\s+/).length
  const minutes = words / wpm

  return {
    words,
    minutes: Math.ceil(minutes),
    time: `${Math.ceil(minutes)} min`,
  }
}
