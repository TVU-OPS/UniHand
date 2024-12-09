import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Post, PostData } from "@/types/post";
import { Link, useFocusEffect } from "expo-router";
import postApi from "@/api/postApi";
import { Ionicons } from "@expo/vector-icons";
import { transform } from "@babel/core";
import WebView from "react-native-webview";
import RenderHtml, { RenderHTML } from "react-native-render-html";

export default function NewsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { width } = useWindowDimensions();

  const customRenderers = {
    figure: ({ TDefaultRenderer, ...props }) => {
      const videoUrl = props.tnode.children[0]?.attributes?.url;
      if (videoUrl) {
        return (
          <WebView
            source={{ uri: videoUrl }}
            style={{ height: 200, width: width - 20 }}
            javaScriptEnabled={true}
          />
        );
      }
      return <TDefaultRenderer {...props} />;
    },
  };

  const fetchPosts = async (page: number) => {
    try {
      const res = await postApi.getPosts(page, 5);
      setPosts(res.data);
      setTotalPages(res.meta.pagination.pageCount);
    } catch (error: any) {
      console.log("Failed to fetch posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts(1);
    }, [])
  );

  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, page - 1);
    const endPage = Math.min(totalPages, page + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pressable
          key={i}
          onPress={() => setPage(i)}
          style={[styles.pageButton, page === i && styles.activePageButton]}
        >
          <Text
            style={[
              page === i ? { color: "#fff" } : { color: "#52525b" },
              { fontWeight: 600 },
            ]}
          >
            {i}
          </Text>
        </Pressable>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        <Pressable
          onPress={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
          style={styles.pageButton}
          disabled={page === 1}
        >
          <Ionicons name="chevron-back-outline" size={16} color="#52525b" />
        </Pressable>
        {pages}
        <Pressable
          onPress={() =>
            setPage((prevPage) => Math.min(prevPage + 1, totalPages))
          }
          style={styles.pageButton}
          disabled={page === totalPages}
        >
          <Ionicons name="chevron-forward-outline" size={16} color="#52525b" />
        </Pressable>
      </View>
    );
  };

  const htmlToText = (html): string => {
    // Loại bỏ tất cả thẻ HTML
    return html.replace(/<[^>]*>/g, "");
  };

  const renderItem = ({ item }: { item: Post }) => (
    <Link style={{ marginTop: 12 }} href={`/post/${item?.documentId}`}>
      <View style={styles.postContainer}>
        {!!item && item?.Image !== null ? (
          <Image
            source={{
              uri:
                `${process.env.EXPO_PUBLIC_API_URL}${item?.Image[0]?.url}` ||
                "https://via.placeholder.com/150",
            }}
            style={styles.image}
          />
        ) : (
          <Image
            source={{
              uri: "https://via.placeholder.com/150",
            }}
            style={styles.image}
          />
        )}

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item?.Title}
          </Text>
          <Text style={styles.content} numberOfLines={2}>
            {item?.Content && htmlToText(item?.Content)}
          </Text>
          <Text style={styles.author} numberOfLines={2}>
            Theo: {item?.Author}
          </Text>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" color="#000" />
            <Text style={styles.date}>
              {new Date(item?.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </Link>
  );

  return (
    <View style={styles.container}>
      {renderPagination()}
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 25,
    backgroundColor: "#fff",
  },
  postContainer: {
    flexDirection: "row",
    marginBottom: 12,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    // padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    gap: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: "#d1d5db",
  },
  textContainer: {
    flex: 1,
    // paddingRight: 10,
    // paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#374151",
  },
  content: {
    fontSize: 12,
    color: "#333",
    marginBottom: 2,
    paddingRight: 2,
  },
  author: {
    fontSize: 11,
    color: "#666",
    marginBottom: 1,
  },
  dateContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  date: {
    fontSize: 11,
    color: "#666",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 4,
  },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  pageButton: {
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 8,
    // paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 5,
    height: 40,
    width: 30,
    color: "#000",
    // padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activePageButton: {
    backgroundColor: "#50bef1",
  },
  pageButtonText: {
    lineHeight: 0,
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
});
