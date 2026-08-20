package com.collegebook.collegebookbackend.college;

import com.collegebook.collegebookbackend.college.dto.CollegeDto;
import com.collegebook.collegebookbackend.college.dto.CourseDto;
import com.collegebook.collegebookbackend.college.entity.College;
import com.collegebook.collegebookbackend.college.entity.Course;
import com.collegebook.collegebookbackend.college.repository.CollegeRepository;
import com.collegebook.collegebookbackend.college.repository.CourseRepository;
import com.collegebook.collegebookbackend.college.service.impl.CollegeServiceImpl;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CollegeServiceTest {

    @Mock
    private CollegeRepository collegeRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private com.collegebook.collegebookbackend.college.repository.DepartmentRepository departmentRepository;

    @Mock
    private com.collegebook.collegebookbackend.college.repository.CollegeRequestRepository collegeRequestRepository;

    private CollegeServiceImpl collegeService;

    @BeforeEach
    void setUp() {
        collegeService = new CollegeServiceImpl(collegeRepository, courseRepository, departmentRepository, collegeRequestRepository);
    }

    @Test
    void testGetAllCollegesSuccess() {
        College c = new College();
        c.setId(UUID.randomUUID());
        c.setName("Dharmsinh Desai University");
        c.setShortName("DDU");
        c.setSlug("ddu");
        c.setEmailDomains(List.of("ddu.ac.in"));

        when(collegeRepository.findAll()).thenReturn(List.of(c));

        List<CollegeDto> list = collegeService.getAllColleges();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("DDU", list.get(0).getShortName());
    }

    @Test
    void testGetCollegeBySlugSuccess() {
        College c = new College();
        c.setId(UUID.randomUUID());
        c.setName("Dharmsinh Desai University");
        c.setSlug("ddu");

        when(collegeRepository.findBySlug("ddu")).thenReturn(Optional.of(c));

        CollegeDto dto = collegeService.getCollegeBySlug("ddu");

        assertNotNull(dto);
        assertEquals("Dharmsinh Desai University", dto.getName());
    }

    @Test
    void testGetCollegeBySlugNotFound() {
        when(collegeRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> collegeService.getCollegeBySlug("unknown"));
        assertEquals(ErrorCode.NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void testGetCoursesByCollegeIdSuccess() {
        UUID collegeId = UUID.randomUUID();
        College c = new College();
        c.setId(collegeId);

        Course crs = new Course();
        crs.setId(UUID.randomUUID());
        crs.setName("Information Technology");
        crs.setShortName("IT");
        crs.setDurationYears((short) 4);
        crs.setCollege(c);

        when(courseRepository.findByCollegeId(collegeId)).thenReturn(List.of(crs));

        List<CourseDto> courses = collegeService.getCoursesByCollegeId(collegeId);

        assertNotNull(courses);
        assertFalse(courses.isEmpty());
        assertEquals("Information Technology", courses.get(0).getName());
        assertEquals(4, courses.get(0).getDurationYears());
    }

    @Test
    void testRequestCollegeSuccess() {
        com.collegebook.collegebookbackend.college.entity.CollegeRequest reqEntity =
                com.collegebook.collegebookbackend.college.entity.CollegeRequest.builder()
                        .id(UUID.randomUUID())
                        .collegeName("Government Engineering College Dahod")
                        .city("Dahod")
                        .state("Gujarat")
                        .requesterEmail("student@gecdahod.ac.in")
                        .requesterName("Vatsal")
                        .status("PENDING")
                        .build();

        when(collegeRequestRepository.save(org.mockito.ArgumentMatchers.any(com.collegebook.collegebookbackend.college.entity.CollegeRequest.class)))
                .thenReturn(reqEntity);

        com.collegebook.collegebookbackend.college.dto.CollegeRequestDto dto =
                com.collegebook.collegebookbackend.college.dto.CollegeRequestDto.builder()
                        .collegeName("Government Engineering College Dahod")
                        .city("Dahod")
                        .state("Gujarat")
                        .requesterEmail("student@gecdahod.ac.in")
                        .requesterName("Vatsal")
                        .build();

        com.collegebook.collegebookbackend.college.dto.CollegeRequestDto result = collegeService.requestCollege(dto);

        assertNotNull(result);
        assertEquals("PENDING", result.getStatus());
        assertEquals("Government Engineering College Dahod", result.getCollegeName());
    }

    @Test
    void testGetDepartmentsByCourseIdSuccess() {
        UUID courseId = UUID.randomUUID();
        Course course = new Course();
        course.setId(courseId);
        course.setName("Bachelor of Technology");
        course.setShortName("B.Tech");

        com.collegebook.collegebookbackend.college.entity.Department dept =
                new com.collegebook.collegebookbackend.college.entity.Department(course, "Information Technology", "IT");
        dept.setId(UUID.randomUUID());

        when(departmentRepository.findByCourseId(courseId)).thenReturn(List.of(dept));

        List<com.collegebook.collegebookbackend.college.dto.DepartmentDto> departments = collegeService.getDepartmentsByCourseId(courseId);

        assertNotNull(departments);
        assertEquals(1, departments.size());
        assertEquals("Information Technology", departments.get(0).getName());
        assertEquals("IT", departments.get(0).getShortName());
    }
}
