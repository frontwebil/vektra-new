import { Illustration } from "@/components/Illustration";
import { Lines } from "@/components/sections";
import { TextLink } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="sec g4 nf" data-hero>
      <Illustration name="knot" className="fx nf__il" density={1.3} />
      <Lines as="h1" className="d120 nf__h" lines={[{ t: "404" }, { t: "Сторінку", dim: true }, { t: "не знайдено" }]} />
      <div className="nf__go" data-r><TextLink href="/">На головну</TextLink></div>
    </section>
  );
}
