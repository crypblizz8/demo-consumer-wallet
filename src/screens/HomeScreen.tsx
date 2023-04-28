import { useActionSheet } from "@expo/react-native-action-sheet";
import { ethers } from "ethers";
import * as React from "react";
import { Button, StyleSheet, View } from "react-native";
import useSWR from "swr";
import {
  alchemyNetworkList,
  useTurnkeyWalletContext,
} from "../TurnkeyWalletContext";
import { ScrollContainer } from "../components/ScrollContainer";
import { LabeledRow, LabeledTextInput } from "../components/design";
import { useTypedNavigation } from "../navigation";
import { getNetworkDisplayValue } from "../shared";

function useWalletQuery() {
  const { signer, network, privateKeyId } = useTurnkeyWalletContext();

  return useSWR(`/wallet/${network}/${privateKeyId}`, async () => {
    return {
      address: await signer.getAddress(),
      balance: await signer.getBalance(),
      transactionCount: await signer.getTransactionCount(),
    };
  });
}

export function HomeScreen() {
  const { privateKeyId } = useTurnkeyWalletContext();

  const walletQuery = useWalletQuery();

  return (
    <ScrollContainer
      onRefresh={async () => {
        await walletQuery.mutate(undefined);
      }}
    >
      <View style={styles.root}>
        <LabeledRow label="Turnkey Private Key ID" value={privateKeyId} />
        <NetworkRow />
        <LabeledRow
          label="Wallet address"
          value={walletQuery.data?.address ?? "–"}
        />
        <LabeledRow
          label="Wallet balance"
          value={
            walletQuery.data?.balance != null
              ? `${ethers.utils.formatEther(walletQuery.data?.balance)} ETH`
              : "–"
          }
        />
        <LabeledRow
          label="Transaction count"
          value={
            walletQuery.data?.transactionCount != null
              ? String(walletQuery.data?.transactionCount)
              : "–"
          }
        />
        <WalletConnectView />
      </View>
    </ScrollContainer>
  );
}

function NetworkRow() {
  const { showActionSheetWithOptions } = useActionSheet();
  const { network: currentNetwork, setNetwork } = useTurnkeyWalletContext();

  return (
    <LabeledRow
      auxiliary="Tap to change"
      label="Current network"
      value={getNetworkDisplayValue(currentNetwork)}
      onValuePress={() => {
        const displayList = alchemyNetworkList.map(getNetworkDisplayValue);

        const options = [...displayList, "Cancel"];
        const cancelButtonIndex = options.length - 1;

        showActionSheetWithOptions(
          {
            options: options,
            cancelButtonIndex,
          },
          (selectedIndex) => {
            if (selectedIndex == null || selectedIndex === cancelButtonIndex) {
              return;
            }

            const selectedNetwork = alchemyNetworkList[selectedIndex];
            if (
              !alchemyNetworkList.includes(selectedNetwork) ||
              selectedNetwork === currentNetwork
            ) {
              return;
            }

            setNetwork(selectedNetwork);
          }
        );
      }}
    />
  );
}

function WalletConnectView() {
  const [uri, setUri] = React.useState<string>("");
  const navigation = useTypedNavigation();

  return (
    <>
      <LabeledTextInput
        value={uri}
        label="WalletConnect link"
        auxiliary="Copy from QR code"
        onChangeText={setUri}
        placeholder="Paste link here (starts with wc:...)"
      />
      <View style={styles.connectButtonWrapper}>
        <Button
          title="Connect"
          disabled={!uri.startsWith("wc:")}
          onPress={() => {
            navigation.navigate("walletconnect", {
              uri,
            });
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  connectButtonWrapper: {
    padding: 4,
  },
});
