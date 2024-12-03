import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons
import { Notification } from "@/types/notification";
import { Linking } from "react-native";
import { Link } from "expo-router";

type SosRequestsListProps = {
  notifications: Notification[];
  onPressRequest: (sosRequest: Notification["SOSRequest"]) => void;
};

const SosRequestsList: React.FC<SosRequestsListProps> = ({
  notifications,
  onPressRequest,
}) => {
  const validSosRequests = notifications
    .map((notification) => notification.SOSRequest)
    .filter((sosRequest) => sosRequest !== null);

  const handleCall = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`; // Định dạng URL để gọi điện
    Linking.openURL(phoneUrl).catch((err) =>
      console.error("Error opening phone", err)
    );
  };

  const truncateDescription = (description: string, maxLength: number) => {
    if (description.length > maxLength) {
      return `${description.slice(0, maxLength)}...`;
    }
    return description;
  };

  const renderRequestItem = ({
    item,
  }: {
    item: Notification["SOSRequest"];
  }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => onPressRequest(item)}
    >
      <View style={styles.header}>
        <Text style={styles.fullName}>{item?.FullName}</Text>
        <Text style={styles.headerRight}>#{item?.id}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.phone}
          onPress={() => handleCall(item?.PhoneNumber)}
        >
          <Text>
            <Ionicons name="call" size={14} color="#fff" />
          </Text>
          <Text style={[styles.phoneText]}>{item?.PhoneNumber}</Text>
        </TouchableOpacity>
        <Link
          href={`/sosMap`}
          style={[styles.phone, { backgroundColor: "#38bdf8" }]}
        >
          <Text>
            <Ionicons name="location" size={14} color="#fff" />
          </Text>
          <Text style={[styles.phoneText]}>Định vị</Text>
        </Link>
      </View>
      <Text style={styles.description}>
        {truncateDescription(item?.RequestDescription, 100)}
      </Text>
      <View style={{ display: "flex", flexDirection: "row" , gap: 3}}>
        <View style={styles.highlightRow}>
          <Text style={styles.label}>
            <Ionicons name="people" size={16} color="#0ea5e9" />
          </Text>
          <Text style={styles.highlightText}>
            {item?.PeopleCount} người cần hỗ trợ  |
          </Text>
        </View>
        <View style={styles.highlightRow}>
          <Text style={styles.label}>
            <Ionicons name="fitness" size={16} color="#0ea5e9" />
          </Text>
          <Text style={styles.highlightText}>
            {item?.NeedWater && "Nước"}
            {item?.NeedFood && ", Thức ăn"}
            {item?.NeedMedical && ", Y tế"}
          </Text>
        </View>
      </View>
      <View style={[styles.highlightRow, styles.address]}>
        <Text style={styles.label}>
          <Ionicons name="location" size={16} color="#0ea5e9" />
        </Text>
        <Text style={styles.highlightText}>
          {item.Province?.FullName}, {item.District?.FullName},{" "}
          {item.Ward?.FullName}
        </Text>
      </View>
      <View style={styles.highlightRow}>
        <Text style={styles.label}>
          <Ionicons name="map" size={16} color="#0ea5e9" />
        </Text>
        <Text style={styles.highlightText}>
          Lat {item?.Location?.lat}, Lng {item?.Location?.lng}
        </Text>
      </View>
      <View style={styles.highlightRow}>
        <Text style={styles.label}>
          <Ionicons name="calendar" size={16} color="#0ea5e9" />
        </Text>
        <Text style={styles.highlightText}>
          {new Date(item?.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={validSosRequests}
      renderItem={renderRequestItem}
      keyExtractor={(item) => item?.id.toString()}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Không có yêu cầu SOS nào.</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#ccc",
    minWidth: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: {
    fontSize: 14,
    color: "#666",
  },
  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f43f5e",
  },

  description: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginRight: 6,
  },

  icon: {
    marginRight: 8,
  },
  needs: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  phone: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
    alignSelf: "flex-start",
    justifyContent: "center",
    borderRadius: 6,
  },
  phoneText: {
    color: "#fff",
    fontWeight: "bold",
  },
  need: {
    backgroundColor: "#50bef1",
    color: "#fff",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  highlightText: {
    fontSize: 14,
    color: "#0ea5e9",
    fontWeight: "500",
  },
  address: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 20,
  },
});

export default SosRequestsList;
