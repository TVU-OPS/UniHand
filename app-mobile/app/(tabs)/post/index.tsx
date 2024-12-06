import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Post, PostData } from "@/types/post";
import { Link, useFocusEffect } from "expo-router";
import postApi from "@/api/postApi";
import { Ionicons } from "@expo/vector-icons";
import { transform } from "@babel/core";

export default function NewsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        <TouchableOpacity
          key={i}
          onPress={() => setPage(i)}
          style={[styles.pageButton, page === i && styles.activePageButton]}
        >
          <Text style={styles.pageButtonText}>{i}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
          style={styles.pageButton}
          disabled={page === 1}
        >
          <Text
            style={[styles.pageButtonText, { paddingTop: 5, paddingRight: 3 }]}
          >
            <Ionicons name="chevron-back-outline" size={24} color="fff" />
          </Text>
        </TouchableOpacity>
        {pages}
        <TouchableOpacity
          onPress={() =>
            setPage((prevPage) => Math.min(prevPage + 1, totalPages))
          }
          style={styles.pageButton}
          disabled={page === totalPages}
        >
          <Text
            style={[styles.pageButtonText, { paddingTop: 5, paddingLeft: 3 }]}
          >
            <Ionicons name="chevron-forward-outline" size={24} color="fff" />
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Post }) => (
    <Link style={{marginTop: 10}} href={`/post/${item.documentId}`}>
      <View style={styles.postContainer}>
        <Image
          source={{
            uri:
              `${process.env.EXPO_PUBLIC_API_URL}${item?.Image?.[0]?.url}` ||
              "https://via.placeholder.com/120",
          }}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.Title}
          </Text>
          <Text style={styles.content} numberOfLines={2}>
            {item.Content}
          </Text>
          <Text style={styles.author} numberOfLines={2}>
            Theo: {item.Author}
          </Text>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" color="#000" />
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </Link>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderPagination}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 40,
  },
  postContainer: {
    flexDirection: "row",
    marginBottom: 10,
    marginTop: 10,
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
    justifyContent: "center",
    // marginTop: 10,
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
    color: "#fff",
    fontWeight: "bold",
  },
});
