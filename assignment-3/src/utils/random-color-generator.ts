export type Generator<T> = { next: () => T };

export class RandomColorGenerator implements Generator<string> {
  colors: string[] = ["black", "pink", "orange", "red"];

  next(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }
}
