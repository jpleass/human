export function useExport() {
  const makeTitleFileSafe = (title: string) => {
    return title
      .slice(0, 100)
      .replace(/[^a-z0-9_\-]/gi, "_")
      .toLowerCase();
  };

  // Export SVG function
  const exportSVG = (title: string) => {
    const svg = document.querySelector("#svg");
    if (!svg) {
      console.error("SVG element not found");
      return;
    }

    const xml =
      '<?xml version="1.0" standalone="no"?>\n' +
      new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = title + ".svg";
    a.click();
  };

  // Export PNG function
  const exportPNG = () => {
    const svg = document.querySelector("#svg");
    if (!svg) {
      console.error("SVG element not found");
      return;
    }

    const WIDTH = parseInt(svg.getAttribute("width") || "2000");
    const HEIGHT = parseInt(svg.getAttribute("height") || "1000");

    const xmlBlob = new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml",
    });
    const url = URL.createObjectURL(xmlBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "title.png";
            a.click();
          }
        });
      }
    };
    img.src = url;
  };

  return {
    exportSVG,
    exportPNG,
    makeTitleFileSafe,
  };
}
