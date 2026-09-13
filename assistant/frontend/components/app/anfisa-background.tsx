const TICKS = Array.from({ length: 48 }, (_, index) => index);
const DOTS = [
  ['12%', '22%', '2s'],
  ['19%', '71%', '5s'],
  ['28%', '18%', '1s'],
  ['70%', '16%', '4s'],
  ['83%', '29%', '0s'],
  ['91%', '67%', '3s'],
  ['73%', '79%', '6s'],
  ['38%', '85%', '2.5s'],
];

export function AnfisaBackground() {
  return (
    <div className="anfisa-background" aria-hidden="true">
      <div className="anfisa-background__haze" />
      <div className="anfisa-background__grid" />
      <div className="anfisa-background__ambient" />
      <div className="anfisa-background__vignette" />

      {DOTS.map(([left, top, delay]) => (
        <span
          key={`${left}-${top}`}
          className="anfisa-background__particle"
          style={{ left, top, animationDelay: delay }}
        />
      ))}

      <svg
        className="anfisa-background__hud"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="anfisa-background__glow-layer">
          <g className="anfisa-background__module anfisa-background__module--left anfisa-background__circuit">
            <path d="M68 108H232L254 130H410" />
            <path d="M68 108L46 130V252L68 274H232" />
            <circle cx="132" cy="191" r="56" />
            <ellipse cx="132" cy="191" rx="56" ry="20" />
            <path d="M89 156C113 174 150 204 174 226M174 156C150 174 113 204 89 226" />
            <path d="M276 154H424M276 176H385M276 198H430M276 220H364" />
          </g>
        </g>

        <g className="anfisa-background__glow-layer">
          <g className="anfisa-background__module anfisa-background__module--top anfisa-background__circuit">
            <path d="M585 130H858" />
            <path d="M610 154H876M646 178H846M598 202H790" />
            <circle cx="890" cy="154" r="5" />
            <circle cx="846" cy="178" r="4" />
            <path d="M1035 139V191M1009 165H1061" />
          </g>
        </g>

        <g className="anfisa-background__glow-layer">
          <g className="anfisa-background__module anfisa-background__module--data anfisa-background__circuit">
            <path
              className="anfisa-background__data-line"
              d="M1192 303H1314M1192 327H1288M1192 351H1328M1192 375H1268"
            />
            <rect
              className="anfisa-background__data-pixel"
              x="1192"
              y="411"
              width="16"
              height="16"
            />
            <rect
              className="anfisa-background__data-pixel"
              x="1219"
              y="385"
              width="16"
              height="16"
            />
            <rect
              className="anfisa-background__data-pixel"
              x="1246"
              y="411"
              width="16"
              height="16"
            />
            <rect
              className="anfisa-background__data-pixel"
              x="1273"
              y="385"
              width="16"
              height="16"
            />
            <rect
              className="anfisa-background__data-pixel"
              x="1300"
              y="411"
              width="16"
              height="16"
            />
          </g>
        </g>

        <g className="anfisa-background__glow-layer">
          <g className="anfisa-background__module anfisa-background__module--chart anfisa-background__circuit">
            <path d="M1188 704V826H1344" />
            <path
              className="anfisa-background__chart-bars"
              d="M1214 800V758M1250 800V728M1286 800V746M1322 800V688"
            />
          </g>
        </g>

        <g className="anfisa-background__glow-layer">
          <g className="anfisa-background__module anfisa-background__module--wave anfisa-background__circuit">
            <path d="M74 758V848H330" />
            <path d="M74 816H322" />
            <path
              className="anfisa-background__waveform"
              d="M74 816C102 816 106 756 132 756C158 756 166 828 194 792C222 756 232 704 260 776C282 832 302 816 322 816"
            />
          </g>
        </g>

        <g className="anfisa-background__glow-layer">
          <g className="anfisa-background__target">
            <circle
              cx="720"
              cy="466"
              r="252"
              className="anfisa-background__ring anfisa-background__ring--outer"
            />
            <circle
              cx="720"
              cy="466"
              r="214"
              className="anfisa-background__ring anfisa-background__ring--bright"
            />
            <circle
              cx="720"
              cy="466"
              r="188"
              className="anfisa-background__ring anfisa-background__ring--segments"
            />
            <circle cx="720" cy="466" r="162" className="anfisa-background__ring" />
            <circle
              cx="720"
              cy="466"
              r="104"
              className="anfisa-background__ring anfisa-background__ring--inner"
            />
            <circle cx="720" cy="466" r="7" className="anfisa-background__core-dot" />
            <path d="M460 466H980M720 206V726" className="anfisa-background__crosshair" />
            <path
              d="M540 286L584 330M900 286L856 330M540 646L584 602M900 646L856 602"
              className="anfisa-background__crosshair"
            />
            <g className="anfisa-background__ticks">
              {TICKS.map((index) => (
                <line
                  key={index}
                  x1="720"
                  y1={index % 4 === 0 ? '239' : '251'}
                  x2="720"
                  y2={index % 4 === 0 ? '260' : '258'}
                  transform={`rotate(${index * 7.5} 720 466)`}
                />
              ))}
            </g>
          </g>
        </g>

        <g className="anfisa-background__glow-layer">
          <g className="anfisa-background__orbit">
            <circle cx="1230" cy="170" r="96" />
            <circle cx="1230" cy="170" r="66" />
            <path d="M1230 74A96 96 0 0 1 1326 170" className="anfisa-background__arc" />
            <path d="M1134 170A96 96 0 0 1 1230 74" className="anfisa-background__arc" />
            <circle cx="1230" cy="170" r="18" className="anfisa-background__core-dot" />
          </g>
        </g>
      </svg>
    </div>
  );
}
