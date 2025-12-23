import { useThree } from "@react-three/fiber";

export default function useXRControllers() {
  const { gl } = useThree();

  const getSources = () => {
    const session = gl.xr?.getSession?.();
    if (!session) return [];
    return Array.from(session.inputSources || []).filter(Boolean);
  };

  const getGamepadSource = (handedness) => {
    const sources = getSources().filter((s) => s.gamepad);
    if (!sources.length) return null;
    const exact = sources.find((s) => s.handedness === handedness);
    return exact || sources[0];
  };

  const readAxes = (source) => {
    const axes = source?.gamepad?.axes ? Array.from(source.gamepad.axes) : [];
    const x = axes[2] !== undefined ? axes[2] : axes[0] || 0;
    const y = axes[3] !== undefined ? axes[3] : axes[1] || 0;
    return { x, y };
  };

  const readButtonPressed = (source, index) => {
    const b = source?.gamepad?.buttons?.[index];
    return !!b && (b.pressed || b.value > 0.5);
  };

  return { getGamepadSource, readAxes, readButtonPressed };
}
