import { createEvent, createStore, restore, combine } from "effector";
import { using, spec, h, route } from "forest";

const vw = 400;
const vh = 400;
const centerX = vw / 2;
const centerY = vh / 2;
const radius = 80;
const grey = "#efefec";
const green = "#77dd77";

const change = createEvent();
const animate = createEvent();

const $progress = restore(change, 25);
const $animated = restore(animate, false);

const $startAngle = createStore(0);
const $endAngle = $progress.map((progress) => (progress * 359.9) / 100);

const $d = combine($startAngle, $endAngle, (startAngle, endAngle) => {
  const start = polarToCartesian(endAngle);
  const end = polarToCartesian(startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  const d = `M ${start.x} ${start.y} A ${radius} ${radius}, 0, ${largeArcFlag}, 0, ${end.x} ${end.y}`;

  return d;
});

function polarToCartesian(angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

const toolbar = () => {
  h("div", () => {
    spec({
      style: {
        position: "absolute",
        margin: 10,
      },
    });

    h("input", {
      attr: {
        type: "range",
        max: "100",
        min: "0",
        value: $progress,
      },
      handler: {
        on: { input: change.prepend((e) => +e.target.value) },
      },
      style: {
        width: 150,
        marginRight: 20,
      },
    });

    h("label", () => {
      spec({
        text: "Animate ",
      });

      h("input", {
        attr: {
          type: "checkbox",
          checked: $animated,
        },
        handler: {
          on: { change: animate.prepend((e) => e.target.checked) },
        },
      });
    });
  });
};

const spinner = () => {
  h("svg", () => {
    spec({
      attr: {
        viewBox: `0 0 ${vw} ${vh}`,
        xmlns: "http://www.w3.org/2000/svg",
      },
      style: {
        border: "2px dashed var(--bcgColor)",
        width: vw,
        height: vh,
      },
      styleVar: {
        bcgColor: grey,
      },
    });

    h("circle", {
      attr: {
        cx: centerX,
        cy: centerY,
        r: radius,
        stroke: "var(--bcgColor)",
        "stroke-width": 10,
        "fill-opacity": 0,
      },
    });

    h("path", () => {
      spec({
        attr: {
          d: $d,
          stroke: green,
          "stroke-width": 10,
          "fill-opacity": 0,
        },
      });

      route({
        source: $animated,
        visible: Boolean,
        fn: () => {
          h("animateTransform", {
            attr: {
              attributeName: "transform",
              attributeType: "XML",
              type: "rotate",
              from: `0 ${centerX} ${centerY}`,
              to: `360 ${centerX} ${centerY}`,
              dur: "1s",
              repeatCount: "indefinite",
            },
          });
        },
      });
    });
  });
};

using(document.getElementById("app"), () => {
  h("div", () => {
    spec({
      style: { position: "relative" },
    });

    toolbar();
    spinner();
  });
});
