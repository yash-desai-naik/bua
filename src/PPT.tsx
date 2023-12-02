import pptxgen from "pptxgenjs";
import { useState } from "react";

import data from "./data.json";

//centimeter to inches
function cmToIn(cm: number) {
  return cm / 2.54;
}

const PPT = () => {
  const [bands, setBands] = useState<
    {
      band: string;
      bandH: number;
      bandW: number;
      bandX: number;
      bandY: number;
    }[]
  >();
  function makePPT() {
    // 1. Create a new Presentation
    let pptx = new pptxgen();

    // Define new layout for the Presentation
    pptx.defineLayout({ name: "A3", width: 16.5, height: 11.7 });

    // Set presentation to use new layout
    pptx.layout = "A3";

    // 2. Add a Slide
    let slide = pptx.addSlide();

    // 3. Add one or more objects (Tables, Shapes, Images, Text and Media) to the Slide
    let textboxText =
      "Emerging Relativity of DRs of CEO & COO - Observations & Analysis";
    let textboxOpts = { y: cmToIn(0.3), color: "006550" };
    slide.addText(textboxText, textboxOpts);

    const bs = data.map((d) => ({ band: d.band }));

    setBands(
      bs.reverse().map((band, index) => ({
        band: band.band,

        bandH: cmToIn(26.73 / bs.length),
        bandW: cmToIn(1),
        bandX: cmToIn(0.5),
        bandY: cmToIn(26.73 - cmToIn(index * 8)),
      }))
    );

    bands?.map((band, index) => {
      slide.addText(band.band, {
        x: band.bandX,
        y: band.bandY,
        w: band.bandW,
        h: band.bandH,

        fontSize: 12,
        align: "center",
        wrap: false,
        // color: "FFFFFF",
      });
    });

    //  // x: cmToIn(0.5),
    //  y: cmToIn(13.2 - cmToIn(index * (1.5 + 2.4))),
    //  w: cmToIn(1.5),
    //  h: cmToIn(0.25),

    // const bands = [
    //   { band: "L1", n: 3 },
    //   { band: "L2", n: 1 },
    //   { band: "L3", n: 4 },
    //   { band: "L4", n: 2 },
    // ];
    // let totalOccupiedHeight = 0;
    // bands.reverse().map((band, index) => {
    //   totalOccupiedHeight += cmToIn((12 * band.n * 0.2) / bands.length);
    //   slide.addText(band.band, {
    //     fill: { color: "006550" },
    //     x: cmToIn(0.5),
    //     y: cmToIn(12 - cmToIn(index * (1.5 + 6.4))),
    //     w: cmToIn(0.25),
    //     h: cmToIn((12 * band.n * 0.2) / bands.length),
    //     // rotate: 270,
    //     fontSize: 8,
    //     align: "center",
    //     wrap: false,
    //     color: "FFFFFF",
    //   });
    //   // slide.addText(band.band, {
    //   //   fill: { color: "006550" },
    //   //   x: cmToIn(0.5),
    //   //   y: cmToIn(12.2 - cmToIn(index * (1.5 + 6.4))),
    //   //   w: cmToIn(0.25),
    //   //   h: cmToIn((12 * band.n * 0.2) / bands.length),
    //   //   // rotate: 270,
    //   //   fontSize: 8,
    //   //   align: "center",
    //   //   wrap: false,
    //   //   color: "FFFFFF",
    //   // });
    // });

    bands?.forEach((band) =>
      data
        .filter((d) => d.band === band.band)
        .map((d1) =>
          d1.uniqueJobs.forEach((job, i) =>
            slide.addText(
              `${job.title}\n(${job.current_grade})\n${job.hayScore}\n`,
              {
                shape: pptx.ShapeType.rect,
                fill: { color: "FFFFFF", type: "none" },
                line: { width: 2, color: "A9A9A9" },
                // x: band.bandX*band.bandW + d1.uniqueJobs.length,
                x: 1 + band.bandX + i * 3.04,
                y:
                  band.bandY +
                  1 -
                  job.hayScore /
                    Math.max(...d1.uniqueJobs.map((o) => o.hayScore)),
                w: cmToIn(2 * job.title.length * 0.1),
                h: cmToIn(1.8),
                fontSize: 12,
                align: "center",
                wrap: true,
                fit: "resize",
              }
            )
          )
        )
    );

    slide.addShape(pptx.ShapeType.line, {
      line: { color: "FF0000", width: 1 },
      points: [
        { x: cmToIn(3.04), y: cmToIn(7.83) },
        { x: cmToIn(10.76), y: cmToIn(20.43) },
      ],
    });

    // 4. Save the Presentation
    pptx.writeFile();
  }

  return (
    <>
      <div>
        <pre className="text-xs">{JSON.stringify(bands, null, 2)}</pre>
        <button onClick={makePPT} className="bg-black p-1 text-gray-50">
          Make PPT
        </button>
      </div>
    </>
  );
};

export default PPT;
