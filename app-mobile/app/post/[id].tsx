import postApi from "@/api/postApi";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Post } from "@/types/post";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React from "react";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Image, View, Text} from "react-native";

export default function PostDetailScreen() {
  const [post, setPost] = useState<Post | null>(null);
  const local = useLocalSearchParams();

  const fetchPost = async () => {
    try {
      const res = await postApi.fetchDetailPost(local.id.toLocaleString());
      setPost(res.data);
    } catch (error: any) {
      console.log("Failed to fetch post:", error);
    }
  };


  useEffect(() => {
    fetchPost();
  }, [local?.id]);

  if (!post) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.containerScroll} showsVerticalScrollIndicator={false}>
        {/* Tiêu đề bài viết */}
        <ThemedText style={styles.title}>{post.Title}</ThemedText>
        {/* Ngày đăng và cập nhật */}
        <View style={styles.createAtContainer}>
          <Ionicons  name="calendar-outline" color="gray" />
          <ThemedText style={styles.metadata}>
            Ngày đăng: {new Date(post.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
        <Image
          source={{
            uri:
              `${process.env.EXPO_PUBLIC_API_URL}${post?.Image[0].url}` ||
              "https://via.placeholder.com/150",
          }}
          style={styles.image}
        />
        {/* Nội dung bài viết */}
        <ThemedText style={styles.content}>{post.Content}</ThemedText>

        {/* Tác giả */}
        <ThemedText style={styles.author}>Nguồn: {post.Author}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  containerScroll: {
    padding: 16,
    paddingBottom: 20
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    objectFit: "cover",
  },
  createAtContainer : {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  metadata: {
    fontSize: 14,
    color: "gray",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    textAlign: "justify",
  },
  author: {
    fontSize: 14,
    color: "gray",
    marginTop: 8,
    fontStyle: "italic",
  },
});
