/* スキマゴルフ LP — Tweaks（FV案切替・アクセント色・角丸） */
const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fv": "C",
  "accent": "orange",
  "round": "default"
}/*EDITMODE-END*/;

const ACCENT_MAP = { "#ff7a2e": "orange", "#ff5d5d": "coral", "#13b08a": "teal" };
const ACCENT_HEX = { orange: "#ff7a2e", coral: "#ff5d5d", teal: "#13b08a" };

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.body.dataset.fv = String(t.fv || "A").toLowerCase();
    document.body.dataset.accent = t.accent || "orange";
    document.body.dataset.round = t.round || "default";
  }, [t.fv, t.accent, t.round]);

  return (
    <TweaksPanel>
      <TweakSection label="ファーストビュー" />
      <TweakRadio
        label="FV案"
        value={t.fv}
        options={["A", "B", "C"]}
        onChange={(v) => setTweak("fv", v)}
      />
      <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 2px 0", lineHeight: 1.5 }}>
        A=写真フル背景／B=分割カード／C=ネイビー地
      </p>

      <TweakSection label="トーン" />
      <TweakColor
        label="アクセント色"
        value={ACCENT_HEX[t.accent] || "#ff7a2e"}
        options={["#ff7a2e", "#ff5d5d", "#13b08a"]}
        onChange={(hex) => setTweak("accent", ACCENT_MAP[hex] || "orange")}
      />
      <TweakRadio
        label="角丸"
        value={t.round}
        options={["sharp", "default", "soft"]}
        onChange={(v) => setTweak("round", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<TweaksApp />);
