package com.alumini.alumini.connect.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alumini.alumini.connect.dto.CommentDto;
import com.alumini.alumini.connect.dto.PostDto;
import com.alumini.alumini.connect.entity.*;
import com.alumini.alumini.connect.repository.PostCommentRepository;
import com.alumini.alumini.connect.repository.PostLikeRepository;
import com.alumini.alumini.connect.repository.PostRepository;
import com.alumini.alumini.connect.repository.UserRepository;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private PostCommentRepository postCommentRepository;

    // Helper: Map Post entity to DTO
    public PostDto mapToDto(Post post) {
        if (post == null) return null;
        PostDto dto = new PostDto();
        dto.setId(post.getId());
        if (post.getCollege() != null) {
            dto.setCollegeId(post.getCollege().getId());
            dto.setCollegeCode(post.getCollege().getCode());
        }
        if (post.getAuthor() != null) {
            dto.setAuthorId(post.getAuthor().getId());
            dto.setAuthorName(post.getAuthor().getFullName());
            dto.setAuthorRole(post.getAuthor().getRole().name().toLowerCase());
            dto.setAuthorImg(post.getAuthor().getPhotoUrl());
        }
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setIsPublic(post.getIsPublic());
        dto.setCreatedAt(post.getCreatedAt());

        // Likes - map user rollNumbers or emails (original front-end uses id which maps to user rollNumber/id)
        List<String> likes = postLikeRepository.findByPostId(post.getId())
                .stream()
                .map(like -> like.getUser().getRollNumber() != null ? like.getUser().getRollNumber() : String.valueOf(like.getUser().getId()))
                .collect(Collectors.toList());
        dto.setLikes(likes);

        // Comments
        List<CommentDto> comments = postCommentRepository.findByPostIdOrderByCommentedAtAsc(post.getId())
                .stream()
                .map(this::mapCommentToDto)
                .collect(Collectors.toList());
        dto.setComments(comments);

        return dto;
    }

    // Helper: Map Comment entity to DTO
    public CommentDto mapCommentToDto(PostComment comment) {
        if (comment == null) return null;
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPost().getId());
        if (comment.getAuthor() != null) {
            dto.setAuthorId(comment.getAuthor().getId());
            dto.setAuthorName(comment.getAuthor().getFullName());
            dto.setAuthorRole(comment.getAuthor().getRole().name().toLowerCase());
        }
        dto.setContent(comment.getContent());
        dto.setCommentedAt(comment.getCommentedAt());
        return dto;
    }

    public PostDto createPost(PostDto dto, Long userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Post post = new Post();
        post.setCollege(author.getCollege());
        post.setAuthor(author);
        post.setAuthorRole(author.getRole().name().toLowerCase());
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());
        post.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : false);

        Post saved = postRepository.save(post);
        return mapToDto(saved);
    }

    public List<PostDto> getFeed(String collegeCode, Long userId) {
        // Own college posts + public posts from other colleges
        List<Post> ownPosts = postRepository.findByCollegeCodeOrderByCreatedAtDesc(collegeCode.toLowerCase());
        List<Post> publicPosts = postRepository.findByIsPublicTrueOrderByCreatedAtDesc();

        ownPosts.addAll(publicPosts);

        // Sort desc by createdAt and deduplicate
        return ownPosts.stream()
                .distinct()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PostDto toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Optional<PostLike> existingLike = postLikeRepository.findByPostIdAndUserId(postId, userId);
        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
        } else {
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            like.setLikedAt(LocalDateTime.now());
            postLikeRepository.save(like);
        }

        // Return updated post
        return mapToDto(post);
    }

    public PostDto addComment(Long postId, CommentDto dto, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setAuthor(user);
        comment.setAuthorRole(user.getRole().name().toLowerCase());
        comment.setContent(dto.getContent());
        comment.setCommentedAt(LocalDateTime.now());

        postCommentRepository.save(comment);

        return mapToDto(post);
    }

    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (user.getRole() != Role.ADMIN && !post.getAuthor().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized: Cannot delete another user's post");
        }

        if (user.getRole() == Role.ADMIN && !post.getCollege().getId().equals(user.getCollege().getId())) {
            throw new IllegalStateException("Unauthorized: Admin cannot delete posts of other colleges");
        }

        postRepository.delete(post);
    }
}
