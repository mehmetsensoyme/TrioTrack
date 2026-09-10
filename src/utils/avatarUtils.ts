export interface AvatarPreset {
  id: string;
  name: string;
  icon: string;
  bg: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'preset_wallet', name: 'Finansör', icon: 'wallet', bg: '#6750A4' },
  { id: 'preset_shield', name: 'Gizlilik', icon: 'shield-checkmark', bg: '#009688' },
  { id: 'preset_flame', name: 'Enerjik', icon: 'flame', bg: '#F29F05' },
  { id: 'preset_rocket', name: 'Girişimci', icon: 'rocket', bg: '#3F51B5' },
  { id: 'preset_leaf', name: 'Minimalist', icon: 'leaf', bg: '#4CAF50' },
  { id: 'preset_star', name: 'Vizyoner', icon: 'star', bg: '#E91E63' },
];

export const getAvatarPreset = (avatarUri: string | null | undefined): AvatarPreset | null => {
  if (avatarUri && avatarUri.startsWith('preset:')) {
    const id = avatarUri.replace('preset:', '');
    return AVATAR_PRESETS.find(p => p.id === id) || null;
  }
  return null;
};
