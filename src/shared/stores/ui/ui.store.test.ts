import { useUIStore } from './ui.store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ immersiveMode: false });
  });

  it('starts with immersiveMode false', () => {
    expect(useUIStore.getState().immersiveMode).toBe(false);
  });

  it('setImmersiveMode sets immersive mode', () => {
    useUIStore.getState().setImmersiveMode(true);
    expect(useUIStore.getState().immersiveMode).toBe(true);

    useUIStore.getState().setImmersiveMode(false);
    expect(useUIStore.getState().immersiveMode).toBe(false);
  });
});
