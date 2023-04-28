import * as Clipboard from "expo-clipboard";
import * as React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";

function LabeledContent(props: {
  label: string;
  auxiliary?: string;
  children: React.ReactNode;
}) {
  const { label, auxiliary, children } = props;

  return (
    <View style={styles.root}>
      <View style={styles.headlineRow}>
        <Text style={styles.headline}>{label}</Text>
        {auxiliary != null ? (
          <Text style={styles.auxiliary}>{auxiliary}</Text>
        ) : null}
      </View>

      {children}
    </View>
  );
}

export function LabeledRow(props: {
  label: string;
  value: string;
  auxiliary?: string;
  onValuePress?: (() => void) | (() => Promise<void>);
}) {
  const { label, value, auxiliary, onValuePress } = props;

  return (
    <TouchableOpacity
      onPress={
        onValuePress ??
        (async () => {
          await Clipboard.setStringAsync(value);

          Toast.show("Copied to clipboard", {
            duration: 500,
            position: -40,
            shadow: false,
          });
        })
      }
    >
      <LabeledContent label={label} auxiliary={auxiliary}>
        <MonospacedText>{value}</MonospacedText>
      </LabeledContent>
    </TouchableOpacity>
  );
}

export function MonospacedText(props: { children: React.ReactNode }) {
  const { children } = props;

  return <Text style={styles.mono}>{children}</Text>;
}

export function LabeledTextInput(props: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  auxiliary?: string;
}) {
  const { label, placeholder, value, onChangeText, auxiliary } = props;

  return (
    <LabeledContent label={label} auxiliary={auxiliary}>
      <TextInput
        style={styles.mono}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        clearButtonMode="while-editing"
        enablesReturnKeyAutomatically={true}
        multiline={false}
        placeholder={placeholder}
        returnKeyType="go"
        value={value}
        onChangeText={onChangeText}
      />
    </LabeledContent>
  );
}

const styles = StyleSheet.create({
  root: {
    marginVertical: 8,
  },
  headlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 4,
  },
  headline: {
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 16 * 1.5,
    flex: 1,
    flexWrap: "wrap",
  },
  auxiliary: {
    fontSize: 14,
    lineHeight: 14 * 1.5,
    color: "rgb(142, 142, 147)",
  },
  mono: {
    fontSize: 14,
    lineHeight: 14 * 1.5,
    fontFamily: Platform.select({
      ios: "Menlo",
      default: "monospace",
    }),
  },
});
