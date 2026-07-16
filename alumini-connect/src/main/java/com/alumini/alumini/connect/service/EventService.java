package com.alumini.alumini.connect.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alumini.alumini.connect.dto.EventDto;
import com.alumini.alumini.connect.entity.College;
import com.alumini.alumini.connect.entity.Event;
import com.alumini.alumini.connect.entity.Role;
import com.alumini.alumini.connect.entity.User;
import com.alumini.alumini.connect.repository.EventRepository;
import com.alumini.alumini.connect.repository.UserRepository;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper: Map Entity to DTO
    public EventDto mapToDto(Event event) {
        if (event == null) return null;
        EventDto dto = new EventDto();
        dto.setId(event.getId());
        if (event.getCollege() != null) {
            dto.setCollegeId(event.getCollege().getId());
            dto.setCollegeCode(event.getCollege().getCode());
            dto.setCollegeName(event.getCollege().getName());
        }
        if (event.getPostedBy() != null) {
            dto.setPostedById(event.getPostedBy().getId());
            dto.setPostedByName(event.getPostedBy().getFullName());
        }
        dto.setTitle(event.getTitle());
        dto.setEventType(event.getEventType());
        dto.setHost(event.getHost());
        dto.setLocation(event.getLocation());
        dto.setTags(event.getTags());
        dto.setDescription(event.getDescription());
        dto.setEventDate(event.getEventDate());
        dto.setIsPublic(event.getIsPublic());
        dto.setCreatedAt(event.getCreatedAt());
        return dto;
    }

    public EventDto createEvent(EventDto dto, Long postedByUserId) {
        User user = userRepository.findById(postedByUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + postedByUserId));

        if (user.getRole() == Role.STUDENT) {
            throw new IllegalStateException("Unauthorized: Students cannot post events");
        }

        College college = user.getCollege();

        Event event = new Event();
        event.setCollege(college);
        event.setPostedBy(user);
        event.setTitle(dto.getTitle());
        event.setEventType(dto.getEventType());
        event.setHost(dto.getHost());
        event.setLocation(dto.getLocation());
        event.setTags(dto.getTags());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : false);

        Event saved = eventRepository.save(event);
        return mapToDto(saved);
    }

    public List<EventDto> getEventsByCollege(String collegeCode, Long userId) {
        List<Event> ownEvents = eventRepository.findByCollegeCode(collegeCode.toLowerCase());
        List<Event> publicEvents = eventRepository.findByIsPublicTrue();

        ownEvents.addAll(publicEvents);

        return ownEvents.stream()
                .distinct()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> getMyEvents(Long userId) {
        return eventRepository.findByPostedById(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EventDto updateEvent(Long id, EventDto dto, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != Role.ADMIN && !event.getPostedBy().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized: Cannot edit another user's event posting");
        }

        if (user.getRole() == Role.ADMIN && !event.getCollege().getId().equals(user.getCollege().getId())) {
            throw new IllegalStateException("Unauthorized: Admin cannot manage postings of other colleges");
        }

        if (dto.getTitle() != null) event.setTitle(dto.getTitle());
        if (dto.getEventType() != null) event.setEventType(dto.getEventType());
        if (dto.getHost() != null) event.setHost(dto.getHost());
        if (dto.getLocation() != null) event.setLocation(dto.getLocation());
        if (dto.getTags() != null) event.setTags(dto.getTags());
        if (dto.getDescription() != null) event.setDescription(dto.getDescription());
        if (dto.getEventDate() != null) event.setEventDate(dto.getEventDate());
        if (dto.getIsPublic() != null) event.setIsPublic(dto.getIsPublic());

        Event updated = eventRepository.save(event);
        return mapToDto(updated);
    }

    public void deleteEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != Role.ADMIN && !event.getPostedBy().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized: Cannot delete another user's event posting");
        }

        if (user.getRole() == Role.ADMIN && !event.getCollege().getId().equals(user.getCollege().getId())) {
            throw new IllegalStateException("Unauthorized: Admin cannot delete postings of other colleges");
        }

        eventRepository.delete(event);
    }
}
