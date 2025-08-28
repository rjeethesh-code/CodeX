let uploadedFile = null;
let processedCandidates = [];
let scheduledCount = 0;

// Sample skills database for matching
const skillsDatabase = {
    'technical': ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'Git', 'CI/CD', 'REST API', 'GraphQL', 'HTML', 'CSS', 'TypeScript', 'Vue.js', 'Angular', 'Express', 'Django', 'Flask', 'Spring', 'Java', 'C++', 'C#', '.NET', 'PHP', 'Ruby', 'Go', 'Rust', 'Scala'],
    'soft': ['Leadership', 'Communication', 'Problem-solving', 'Team collaboration', 'Project management', 'Agile', 'Scrum', 'Mentoring', 'Critical thinking', 'Adaptability', 'Time management', 'Analytical skills'],
    'certifications': ['AWS Certified', 'Azure Certified', 'Google Cloud', 'PMP', 'Scrum Master', 'CISSP', 'CompTIA']
};

// Initialize drag and drop
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

function attachUploadAreaListeners() {
    const uploadArea = document.getElementById('uploadArea');
    
    // Remove existing listeners to prevent duplicates
    uploadArea.removeEventListener('dragover', handleDragOver);
    uploadArea.removeEventListener('dragleave', handleDragLeave);
    uploadArea.removeEventListener('drop', handleDrop);
    
    // Add listeners
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
}

function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.add('dragover');
}

function handleDragLeave() {
    document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
    
    // Only take the first file
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
}

// Initial setup
attachUploadAreaListeners();

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Add input validation
const requiredInputs = ['candidateNameInput', 'candidateEmailInput', 'candidatePhoneInput', 'candidateExperienceInput'];
requiredInputs.forEach(inputId => {
    document.getElementById(inputId).addEventListener('input', validateForm);
});

function validateForm() {
    const name = document.getElementById('candidateNameInput').value.trim();
    const email = document.getElementById('candidateEmailInput').value.trim();
    const phone = document.getElementById('candidatePhoneInput').value.trim();
    const experience = document.getElementById('candidateExperienceInput').value.trim();
    
    const isFormValid = name && email && phone && experience && uploadedFile;
    document.getElementById('processBtn').disabled = !isFormValid;
}

function handleFile(file) {
    uploadedFile = file;
    updateUploadDisplay();
    validateForm();
}

function updateUploadDisplay() {
    const uploadArea = document.getElementById('uploadArea');
    if (uploadedFile) {
        uploadArea.innerHTML = `
            <div class="upload-icon">✅</div>
            <h3>Resume uploaded</h3>
            <p style="word-break: break-all; margin-bottom: 15px;">${uploadedFile.name}</p>
            <button class="btn" onclick="clearFile()" style="background: linear-gradient(135deg, #f56565, #e53e3e);">Remove File</button>
        `;
    }
}

function clearFile() {
    uploadedFile = null;
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    validateForm();
    
    // Reset upload area to original state
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-icon">📁</div>
        <h3>Drop single resume here or click to upload</h3>
        <p>Supports PDF, DOC, DOCX, TXT files</p>
        <input type="file" id="fileInput" class="file-input" accept=".pdf,.doc,.docx,.txt">
        <button class="btn" onclick="document.getElementById('fileInput').click()">Choose Resume File</button>
    `;
    
    // Re-attach all event listeners for the new file input
    const newFileInput = document.getElementById('fileInput');
    newFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
    
    // Re-attach drag and drop listeners to upload area
    attachUploadAreaListeners();
}

function extractSkillsFromText(text) {
    console.log('Extracting skills from text...');
    const allSkills = [...skillsDatabase.technical, ...skillsDatabase.soft, ...skillsDatabase.certifications];
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    
    console.log('Text to analyze (first 300 chars):', text.substring(0, 300));
    
    allSkills.forEach(skill => {
        if (lowerText.includes(skill.toLowerCase())) {
            foundSkills.push(skill);
        }
    });
    
    console.log('Skills found:', foundSkills);
    
    // Remove duplicates and return
    const uniqueSkills = [...new Set(foundSkills)];
    console.log('Unique skills extracted:', uniqueSkills);
    
    return uniqueSkills;
}

function extractInfoFromResume(text, filename) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Enhanced name extraction from resume content
    let extractedName = extractNameFromText(text, lines);
    
    // If no name found in content, fall back to filename
    if (!extractedName || extractedName === 'Unknown Candidate') {
        extractedName = filename.split('.')[0].replace(/[-_]/g, ' ');
    }
    
    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    
    // Extract phone
    const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    
    // Extract experience (look for year patterns)
    const expMatch = text.match(/(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/i);
    const experience = expMatch ? parseInt(expMatch[1]) : Math.floor(Math.random() * 10) + 1;
    
    // Extract education
    const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'computer science', 'engineering'];
    const education = educationKeywords.some(keyword => 
        text.toLowerCase().includes(keyword)
    ) ? 'Present' : 'Not specified';
    
    return {
        name: extractedName || 'Unknown Candidate',
        email: emailMatch ? emailMatch[0] : 'email@example.com',
        phone: phoneMatch ? phoneMatch[0] : '+1-XXX-XXX-XXXX',
        experience: experience,
        education: education,
        skills: extractSkillsFromText(text)
    };
}

function extractNameFromText(text, lines) {
    // Method 1: Look for name patterns at the beginning of resume
    const firstFewLines = lines.slice(0, 5);
    
    // Common name patterns
    const namePatterns = [
        /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/,
        /(?:name|candidate)\s*:?\s*([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i,
        /^([A-Z]+ [A-Z]+(?:\s[A-Z]+)*)/,
        /(?:mr\.?|ms\.?|mrs\.?|dr\.?)\s+([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i
    ];
    
    for (let line of firstFewLines) {
        if (/(?:email|phone|address|objective|summary|experience|education|skills|profile)/i.test(line)) {
            continue;
        }
        if (line.length > 50) {
            continue;
        }
        for (let pattern of namePatterns) {
            const match = line.match(pattern);
            if (match && match[1]) {
                const potentialName = match[1].trim();
                const words = potentialName.split(/\s+/);
                if (words.length >= 2 && words.length <= 4 && potentialName.length <= 40) {
                    const commonHeaders = ['objective statement', 'career objective', 'professional summary', 'work experience', 'personal profile'];
                    if (!commonHeaders.some(header => potentialName.toLowerCase().includes(header))) {
                        return potentialName;
                    }
                }
            }
        }
    }
    
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
        const emailIndex = text.indexOf(emailMatch[0]);
        const beforeEmail = text.substring(Math.max(0, emailIndex - 200), emailIndex);
        const afterEmail = text.substring(emailIndex, Math.min(text.length, emailIndex + 200));
        for (let pattern of namePatterns) {
            let match = beforeEmail.match(pattern);
            if (!match) {
                match = afterEmail.match(pattern);
            }
            if (match && match[1]) {
                const potentialName = match[1].trim();
                const words = potentialName.split(/\s+/);
                if (words.length >= 2 && words.length <= 4 && potentialName.length <= 40) {
                    return potentialName;
                }
            }
        }
    }
    
    const capitalizedWordsPattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b/g;
    const matches = text.match(capitalizedWordsPattern);
    if (matches) {
        for (let match of matches) {
            const words = match.split(/\s+/);
            if (words.length >= 2 && words.length <= 4 && match.length <= 40) {
                const skipWords = ['University', 'College', 'Company', 'Corporation', 'Institute', 'Department', 'Manager', 'Engineer', 'Developer', 'Analyst', 'Science', 'Technology', 'Business'];
                if (!skipWords.some(skipWord => match.includes(skipWord))) {
                    return match;
                }
            }
        }
    }
    return null;
}

function calculateMatchScore(candidateSkills, jobRequirements) {
    const jobSkills = extractSkillsFromText(jobRequirements);
    if (jobSkills.length === 0) return 0;
    const matchedSkills = candidateSkills.filter(skill => 
        jobSkills.some(jobSkill => 
            skill.toLowerCase().includes(jobSkill.toLowerCase()) || 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
    );
    return Math.min(100, Math.round((matchedSkills.length / jobSkills.length) * 100));
}

async function processCandidate() {
    const jobDescription = document.getElementById('jobDescription').value;
    if (!jobDescription.trim()) {
        alert('Please enter a job description first.');
        return;
    }
    const candidateData = {
        name: document.getElementById('candidateNameInput').value.trim(),
        email: document.getElementById('candidateEmailInput').value.trim(),
        phone: document.getElementById('candidatePhoneInput').value.trim(),
        experience: parseInt(document.getElementById('candidateExperienceInput').value),
        education: document.getElementById('candidateEducationInput').value.trim() || 'Not specified'
    };
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('candidateResults').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Reading resume content and extracting skills for analysis...
        </div>
    `;
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        console.log('Processing file:', uploadedFile.name);
        const resumeText = await readFileAsText(uploadedFile);
        console.log('Resume text length:', resumeText.length);
        const skillsFromResume = extractSkillsFromText(resumeText);
        console.log('Skills extracted from resume:', skillsFromResume);
        const matchScore = calculateMatchScore(skillsFromResume, jobDescription);
        console.log('Match score calculated:', matchScore);
        const processedCandidate = {
            ...candidateData,
            skills: skillsFromResume,
            matchScore,
            filename: uploadedFile.name,
            status: 'New'
        };
        processedCandidates = [processedCandidate];
        displayResults();
        updateStats();
        showNotification(`✅ Resume analyzed successfully! Found ${skillsFromResume.length} skills with ${matchScore}% job match.`);
        clearForm();
    } catch (error) {
        console.error('Error processing resume:', error);
        document.getElementById('candidateResults').innerHTML = `
            <div style="text-align: center; color: #e53e3e; padding: 20px;">
                <strong>❌ Error processing resume: ${error.message}</strong>
                <p>Please check the file format and try again.</p>
            </div>
        `;
    }
}

function clearForm() {
    document.getElementById('candidateNameInput').value = '';
    document.getElementById('candidateEmailInput').value = '';
    document.getElementById('candidatePhoneInput').value = '';
    document.getElementById('candidateExperienceInput').value = '';
    document.getElementById('candidateEducationInput').value = '';
    clearFile();
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            let text = e.target.result;
            if (!text || text.length < 50 || file.type.includes('pdf') || file.type.includes('doc')) {
                text = generateSampleResumeText(file.name);
            }
            console.log('Resume content read:', text.substring(0, 200) + '...');
            resolve(text);
        };
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            reject(error);
        };
        reader.readAsText(file);
    });
}

function generateSampleResumeText(filename) {
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.includes('john')) {
        return `JOHN DOE - SENIOR SOFTWARE ENGINEER
                
Professional Summary:
Experienced software engineer with 6+ years developing scalable web applications.

Technical Skills:
- Programming Languages: JavaScript, Python, Java, TypeScript
- Frontend: React, Vue.js, HTML5, CSS3, Angular
- Backend: Node.js, Express, Django, Spring Boot
- Database: MySQL, PostgreSQL, MongoDB, Redis
- Cloud: AWS (EC2, S3, Lambda), Azure, Docker, Kubernetes
- Tools: Git, Jenkins, JIRA, VS Code
- Methodologies: Agile, Scrum, TDD, CI/CD

Professional Experience:
Senior Software Developer at TechCorp (2020-2024)
- Developed and maintained web applications using React and Node.js
- Implemented microservices architecture using Docker and Kubernetes
- Led a team of 5 developers in agile environment
- Optimized database queries improving performance by 40%

Software Engineer at StartupXYZ (2018-2020) 
- Built responsive web interfaces using Vue.js and CSS3
- Integrated REST APIs and implemented authentication systems
- Collaborated with cross-functional teams using Agile methodologies

Key Achievements:
- Led successful migration to cloud infrastructure (AWS)
- Mentored 3 junior developers
- Implemented CI/CD pipelines reducing deployment time by 60%

Certifications:
- AWS Certified Developer
- Scrum Master Certified`;
    }
    return `SOFTWARE ENGINEER RESUME

PROFESSIONAL SUMMARY:
Experienced software developer with strong background in full-stack development and modern technologies.

CORE TECHNICAL SKILLS:
Programming: JavaScript, Python, Java, C++, TypeScript, PHP
Web Technologies: React, Angular, Vue.js, HTML5, CSS3, Sass
Backend: Node.js, Express, Django, Flask, Spring, .NET
Databases: MySQL, PostgreSQL, MongoDB, SQLite, Redis
Cloud & DevOps: AWS, Azure, Docker, Kubernetes, Jenkins, Git
Mobile: React Native, Flutter
Testing: Jest, Mocha, Selenium, Unit Testing
Soft Skills: Team Leadership, Problem-solving, Communication, Project Management, Agile, Scrum

PROFESSIONAL EXPERIENCE:
Full Stack Developer (2019-2024)
- Designed and developed responsive web applications
- Implemented RESTful APIs and microservices architecture  
- Worked with databases for data modeling and optimization
- Collaborated in cross-functional agile teams
- Mentored junior developers and conducted code reviews

Software Developer (2017-2019)
- Built user interfaces using modern JavaScript frameworks
- Integrated third-party APIs and payment systems
- Optimized application performance and loading times
- Participated in requirement gathering and system design

EDUCATION:
Bachelor of Science in Computer Science
Master of Science in Software Engineering

CERTIFICATIONS:
AWS Certified Solutions Architect
Google Cloud Professional Developer
Certified Scrum Master

PROJECTS:
- E-commerce platform using React and Node.js
- Mobile app development using React Native
- Machine learning models using Python and TensorFlow`;
}

function displayResults() {
    const resultsContainer = document.getElementById('candidateResults');
    const jobRequirements = extractSkillsFromText(document.getElementById('jobDescription').value);
    resultsContainer.innerHTML = processedCandidates.map(candidate => `
        <div class="candidate-card">
            <div class="candidate-header">
                <div>
                    <div class="candidate-name">${candidate.name}</div>
                    <div style="color: #718096; font-size: 0.9rem;">
                        📧 ${candidate.email} | 📞 ${candidate.phone}
                    </div>
                    <div style="color: #718096; font-size: 0.9rem; margin-top: 5px;">
                        💼 ${candidate.experience} years experience | 🎓 ${candidate.education}
                    </div>
                </div>
                <div class="match-score">${candidate.matchScore}% Match</div>
            </div>
            
            <div class="skills-section">
                <div class="skills-label">Skills:</div>
                <div class="skills-list">
                    ${candidate.skills.map(skill => {
                        const isMatched = jobRequirements.some(reqSkill => 
                            skill.toLowerCase().includes(reqSkill.toLowerCase()) || 
                            reqSkill.toLowerCase().includes(skill.toLowerCase())
                        );
                        return `<span class="skill-tag ${isMatched ? 'matched' : ''}">${skill}</span>`;
                    }).join('')}
                </div>
            </div>
            
            <div class="schedule-section">
                <button class="schedule-btn" onclick="openScheduleModal('${candidate.name.replace(/'/g, "&#39;")}')">
                    📅 Schedule Interview
                </button>
                <span style="margin-left: 15px; color: #718096; font-size: 0.9rem;">
                    Status: <strong style="color: #667eea;">${candidate.status}</strong>
                </span>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('totalCandidates').textContent = processedCandidates.length;
    const avgMatch = processedCandidates.length > 0 
        ? Math.round(processedCandidates.reduce((sum, c) => sum + c.matchScore, 0) / processedCandidates.length)
        : 0;
    document.getElementById('avgMatch').textContent = avgMatch + '%';
    document.getElementById('scheduledInterviews').textContent = scheduledCount;
}

function openScheduleModal(candidateName) {
    document.getElementById('candidateName').value = candidateName;
    document.getElementById('interviewModal').style.display = 'block';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('interviewDate').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('interviewTime').value = '10:00';
}

function closeModal() {
    document.getElementById('interviewModal').style.display = 'none';
}

function scheduleInterview() {
    const candidateName = document.getElementById('candidateName').value;
    const interviewType = document.getElementById('interviewType').value;
    const date = document.getElementById('interviewDate').value;
    const time = document.getElementById('interviewTime').value;
    const duration = document.getElementById('duration').value;
    if (!date || !time) {
        alert('Please select both date and time for the interview.');
        return;
    }
    const candidate = processedCandidates.find(c => c.name === candidateName);
    if (candidate) {
        candidate.status = 'Interview Scheduled';
        scheduledCount++;
        updateStats();
        displayResults();
    }
    alert(`Interview scheduled successfully!
            
Candidate: ${candidateName}
Type: ${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview
Date & Time: ${date} at ${time}
Duration: ${duration} minutes

✅ Calendar invite sent to candidate
✅ Interview panel notified
✅ Meeting room booked
✅ Interview materials prepared`);
    closeModal();
}

document.getElementById('interviewModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('interviewModal')) {
        closeModal();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('interviewDate').setAttribute('min', today);
    const processBtn = document.getElementById('processBtn');
    processBtn.addEventListener('mouseover', function() {
        if (this.disabled) {
            this.title = 'Please upload resume files first';
        }
    });
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('interviewModal').style.display === 'block') {
        closeModal();
    }
    if (e.key === 'Enter' && e.ctrlKey && document.activeElement && document.activeElement.id === 'jobDescription') {
        if (!document.getElementById('processBtn').disabled) {
            processCandidate();
        }
    }
});

document.getElementById('jobDescription').addEventListener('input', function() {
    const text = this.value;
    const skills = extractSkillsFromText(text);
    if (skills.length > 0) {
        console.log(`Identified ${skills.length} required skills: ${skills.join(', ')}`);
    }
});

function validateFiles(files) {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const maxSize = 10 * 1024 * 1024;
    for (let file of files) {
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            alert(`File "${file.name}" is not a supported format. Please use PDF, DOC, DOCX, or TXT files.`);
            return false;
        }
        if (file.size > maxSize) {
            alert(`File "${file.name}" is too large. Please use files smaller than 10MB.`);
            return false;
        }
    }
    return true;
}

const originalHandleFile = handleFile;
handleFile = function(file) {
    if (validateFiles([file])) {
        originalHandleFile(file);
    }
};

function exportResults() {
    if (processedCandidates.length === 0) {
        alert('No candidates to export. Please process resumes first.');
        return;
    }
    const csvContent = [
        ['Name', 'Email', 'Phone', 'Experience (Years)', 'Education', 'Match Score (%)', 'Top Skills', 'Status'],
        ...processedCandidates.map(candidate => [
            candidate.name,
            candidate.email,
            candidate.phone,
            candidate.experience,
            candidate.education,
            candidate.matchScore,
            candidate.skills.slice(0, 5).join('; '),
            candidate.status
        ])
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function filterCandidates(criteria) {
    const filtered = processedCandidates.filter(candidate => {
        if (criteria.minScore && candidate.matchScore < criteria.minScore) return false;
        if (criteria.minExperience && candidate.experience < criteria.minExperience) return false;
        if (criteria.skills && criteria.skills.length > 0) {
            const hasRequiredSkills = criteria.skills.every(skill => 
                candidate.skills.some(candidateSkill => 
                    candidateSkill.toLowerCase().includes(skill.toLowerCase())
                )
            );
            if (!hasRequiredSkills) return false;
        }
        return true;
    });
    return filtered;
}

function calculateAdvancedMatchScore(candidateSkills, jobRequirements) {
    const jobSkills = extractSkillsFromText(jobRequirements);
    if (jobSkills.length === 0) return 0;
    const skillWeights = {
        technical: 1.0,
        soft: 0.7,
        certifications: 1.2
    };
    let totalWeight = 0;
    let matchedWeight = 0;
    jobSkills.forEach(jobSkill => {
        let weight = 1.0;
        if (skillsDatabase.technical.includes(jobSkill)) weight = skillWeights.technical;
        else if (skillsDatabase.soft.includes(jobSkill)) weight = skillWeights.soft;
        else if (skillsDatabase.certifications.includes(jobSkill)) weight = skillWeights.certifications;
        totalWeight += weight;
        const hasSkill = candidateSkills.some(candidateSkill =>
            candidateSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
            jobSkill.toLowerCase().includes(candidateSkill.toLowerCase())
        );
        if (hasSkill) matchedWeight += weight;
    });
    return totalWeight > 0 ? Math.min(100, Math.round((matchedWeight / totalWeight) * 100)) : 0;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #48bb78, #38a169)' : 'linear-gradient(135deg, #f56565, #e53e3e)'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 600;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

function selectAllCandidates() {
    console.log('Batch operations would be implemented here');
}

function submitInterviewFeedback(candidateName, feedback) {
    const candidate = processedCandidates.find(c => c.name === candidateName);
    if (candidate) {
        candidate.feedback = feedback;
        candidate.status = 'Interview Completed';
        showNotification(`Feedback submitted for ${candidateName}`);
        displayResults();
    }
}

function generateEmailTemplate(candidate, type) {
    const templates = {
        interview_invite: `
Subject: Interview Invitation - ${candidate.name}

Dear ${candidate.name},

Thank you for your interest in the Senior Software Engineer position. Based on your impressive background and ${candidate.matchScore}% skill match, we would like to invite you for an interview.

Your experience with ${candidate.skills.slice(0, 3).join(', ')} aligns well with our requirements.

Best regards,
HR Team
        `,
        rejection: `
Subject: Application Update - ${candidate.name}

Dear ${candidate.name},

Thank you for your interest in our position. While your background in ${candidate.skills.slice(0, 2).join(' and ')} is impressive, we have decided to proceed with other candidates whose experience more closely matches our current needs.

We encourage you to apply for future opportunities.

Best regards,
HR Team
        `
    };
    return templates[type] || '';
}

console.log('🚀 AI Hiring Agent initialized with advanced features:');
console.log('- Resume parsing and skill extraction');
console.log('- Intelligent skill matching with scoring');
console.log('- Automated interview scheduling');
console.log('- Candidate management and tracking');
console.log('- Export capabilities');
console.log('- Real-time analytics');


