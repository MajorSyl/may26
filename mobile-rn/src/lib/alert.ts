import { Platform, Alert as RNAlert } from 'react-native';

type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
}

// react-native-web's Alert.alert() is a hard no-op (see
// node_modules/react-native-web/src/exports/Alert) -- no dialog, no
// buttons, callbacks never fire. Every confirm/notice dialog built on top
// of RN's Alert.alert was silently dead on the web build as a result. This
// is a drop-in replacement with the same call signature: native keeps
// using the real Alert, web falls back to window.confirm/alert.
function alert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    RNAlert.alert(title, message, buttons as any);
    return;
  }

  const text = message ? `${title}\n\n${message}` : title;

  if (!buttons || buttons.length === 0) {
    window.alert(text);
    return;
  }
  if (buttons.length === 1) {
    window.alert(text);
    buttons[0].onPress?.();
    return;
  }

  const cancelButton = buttons.find((b) => b.style === 'cancel');
  const confirmButton = buttons.find((b) => b !== cancelButton) || buttons[buttons.length - 1];
  if (window.confirm(text)) {
    confirmButton.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}

export const Alert = { alert };
