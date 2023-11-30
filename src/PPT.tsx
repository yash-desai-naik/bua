import pptxgen from "pptxgenjs";

//centimeter to inches
function cmToIn(cm: number) {
  return cm / 2.54;
}

const PPT = () => {
  function makePPT() {
    // 1. Create a new Presentation
    let pres = new pptxgen();

    // 2. Add a Slide
    let slide = pres.addSlide();

    // 3. Add one or more objects (Tables, Shapes, Images, Text and Media) to the Slide
    let textboxText =
      "Emerging Relativity of DRs of CEO & COO - Observations & Analysis";
    let textboxOpts = { y: cmToIn(0.4), color: "006550" };
    slide.addText(textboxText, textboxOpts);

    // // Shapes without text
    // slide.addShape(pres.ShapeType.rect, { fill: { color: "FF0000" } });
    // slide.addShape(pres.ShapeType.ellipse, {
    //   fill: { type: "solid", color: "0088CC" },
    // });
    // slide.addShape(pres.ShapeType.line, {
    //   line: { color: "FF0000", width: 1 },
    // });

    // // Shapes with text
    // slide.addText("ShapeType.rect", {
    //   shape: pres.ShapeType.rect,
    //   fill: { color: "FF0000" },
    // });
    // slide.addText("ShapeType.ellipse", {
    //   shape: pres.ShapeType.ellipse,
    //   fill: { color: "FF0000" },
    // });
    // slide.addText("ShapeType.line", {
    //   shape: pres.ShapeType.line,
    //   line: { color: "FF0000", width: 1, dashType: "lgDash" },
    // });

    [{ band: "L1" }, { band: "L2" }, { band: "L3" }, { band: "L4" }]
      .reverse()
      .map((band, index) => {
        slide.addText(band.band, {
          fill: { color: "006550" },
          // x: cmToIn(0.5),
          y: cmToIn(13.2 - cmToIn(index * (1.5 + 2.4))),
          w: cmToIn(1.5),
          h: cmToIn(0.25),
          rotate: 270,
          fontSize: 8,
          align: "center",
          wrap: false,
          color: "FFFFFF",
        });
      });

    
      slide.addText('CEO\n(L1)\n\n1200', {
        shape:pres.ShapeType.rect,
        fill: { color: "FFFFFF", type:"none" },
        line:{ width:2, color:'A9A9A9' },

       
        x: cmToIn(1.5),
        y: cmToIn(10.2),
        w: cmToIn(2.5),
        h: cmToIn(2.5),
        fontSize: 12,
        align: "center",
        wrap: false,
        
      })

    // 4. Save the Presentation
    pres.writeFile();
  }

  return (
    <>
      <div>
        <button onClick={makePPT}>Make PPT</button>
      </div>
    </>
  );
};

export default PPT;
