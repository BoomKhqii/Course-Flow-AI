import { useEffect, useRef, useState } from 'react'
import './App.css'

const starterMessages = [
  {
    id: 1,
    role: 'assistant',
    text: "Hi, I'm your Course Flow assistant. Tell me what you're studying or paste in an assessment, and we'll turn it into a clear plan.",
  },
]

const suggestions = [
  'Could you add these assessment/reminder to my calendar?',
  'Help me prioritise',
  'Could you create a timetable for my classes?',
]

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const dateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date, amount) => {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

const addMonths = (date, amount) => {
  const next = new Date(date.getFullYear(), date.getMonth() + amount, 1)
  return next
}

const startOfWeek = (date) => {
  const dayIndex = (date.getDay() + 6) % 7
  return addDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), -dayIndex)
}

const isSameDay = (first, second) => dateKey(first) === dateKey(second)

const formatClockTime = (hour) => {
  const hours = Math.floor(hour)
  const minutes = Math.round((hour - hours) * 60)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`
}

const scheduleTones = ['blue', 'peach', 'mint', 'lilac']
const studyDayStart = 9
const studyDayEnd = 17
const calendarDayStart = 8
const calendarDayEnd = 24
const calendarTimeLabels = ['8 AM', '12 PM', '4 PM', '8 PM']
const maximumFocusBlockMinutes = 120

const parseDateKey = (value) => {
  if (!value) return null

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return Number.isNaN(date.getTime()) ? null : date
}

const parseClockTime = (value) => {
  if (typeof value !== 'string') return null
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(value.trim())
  return match ? Number(match[1]) + (Number(match[2]) / 60) : null
}

const formatDueDate = (deadline, deadlineTime = null) => {
  if (!deadline) return 'No date set'
  const parsedTime = parseClockTime(deadlineTime)
  const timeLabel = parsedTime === null ? '' : `, ${formatClockTime(parsedTime)}`
  return `Due ${deadline.getDate()} ${monthNames[deadline.getMonth()]}${timeLabel}`
}

const createDemoAssessments = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentWeekEnd = addDays(startOfWeek(today), 6)
  const thisWeekDeadline = today < currentWeekEnd ? addDays(today, 1) : today
  const nextWeekStart = addDays(startOfWeek(today), 7)

  return [
    {
      assessmentTitle: 'Debugging quiz review',
      subject: 'Programming Fundamentals',
      deadline: dateKey(thisWeekDeadline),
      deadlineTime: '16:00',
      scheduleFrom: dateKey(today),
      tone: 'blue',
      tasks: [
        { title: 'Review debugging patterns and complete the practice quiz', estimatedMinutes: 75 },
      ],
    },
    {
      assessmentTitle: 'Lab 4 topology plan',
      subject: 'Computer Networks',
      deadline: dateKey(addDays(nextWeekStart, 1)),
      deadlineTime: '17:00',
      scheduleFrom: dateKey(nextWeekStart),
      tone: 'mint',
      tasks: [
        { title: 'Create and validate the network topology plan', estimatedMinutes: 105 },
      ],
    },
    {
      assessmentTitle: 'Normalisation worksheet',
      subject: 'Database Systems',
      deadline: dateKey(addDays(nextWeekStart, 3)),
      deadlineTime: '18:00',
      scheduleFrom: dateKey(addDays(nextWeekStart, 2)),
      tone: 'lilac',
      tasks: [
        { title: 'Complete the database normalisation worksheet', estimatedMinutes: 90 },
      ],
    },
    {
      assessmentTitle: 'Prototype critique',
      subject: 'Design Studio',
      deadline: dateKey(addDays(nextWeekStart, 5)),
      deadlineTime: '13:30',
      scheduleFrom: dateKey(addDays(nextWeekStart, 4)),
      tone: 'peach',
      tasks: [
        { title: 'Prepare the interface prototype critique', estimatedMinutes: 120 },
      ],
    },
  ]
}

const getPriority = (deadline, today) => {
  if (!deadline) return 'Low'

  const daysRemaining = Math.ceil((deadline - today) / 86400000)
  if (daysRemaining <= 3) return 'High'
  if (daysRemaining <= 7) return 'Medium'
  return 'Low'
}

const eventsOverlap = (firstStart, firstDuration, secondStart, secondDuration) => (
  firstStart < secondStart + secondDuration
  && firstStart + firstDuration > secondStart
)

const findAvailableSlot = (
  startDate,
  finalStudyDate,
  minutes,
  occupiedEvents,
  earliestStartTime,
  finalDayEndTime = studyDayEnd,
) => {
  const duration = minutes / 60
  const actualToday = new Date()

  for (let date = new Date(startDate); date <= finalStudyDate; date = addDays(date, 1)) {
    const key = dateKey(date)
    const eventsForDay = occupiedEvents.filter((event) => event.date === key && !event.allDay)
    const firstTime = isSameDay(date, actualToday)
      ? Math.max(studyDayStart, earliestStartTime)
      : studyDayStart
    const lastTime = isSameDay(date, finalStudyDate)
      ? Math.min(studyDayEnd, finalDayEndTime)
      : studyDayEnd

    for (let time = firstTime; time + duration <= lastTime; time += 0.5) {
      const isFree = eventsForDay.every((event) => (
        !eventsOverlap(time, duration, event.time, event.duration)
      ))

      if (isFree) return { date: key, time, duration }
    }
  }

  return null
}

const scheduleAssessments = (assessments, existingEvents) => {
  const now = new Date()
  const earliestStartTime = Math.ceil((now.getHours() + (now.getMinutes() / 60)) * 2) / 2
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const runId = Date.now()
  const occupiedEvents = [...existingEvents]
  const calendarEvents = []
  const tasks = []
  const reports = []

  assessments.forEach((assessment, assessmentIndex) => {
    const assessmentId = assessment.id || `ai-assessment-${runId}-${assessmentIndex}`
    const assessmentTitle = assessment.assessmentTitle || `Assessment ${assessmentIndex + 1}`
    const subject = assessment.subject || 'Course'
    const deadline = parseDateKey(assessment.deadline)
    const deadlineTime = parseClockTime(assessment.deadlineTime)
    const requestedStartDate = parseDateKey(assessment.scheduleFrom)
    const schedulingStartDate = requestedStartDate && requestedStartDate > today
      ? requestedStartDate
      : today
    const assessmentTasks = Array.isArray(assessment.tasks) ? assessment.tasks : []
    const tone = assessment.tone || scheduleTones[assessmentIndex % scheduleTones.length]
    let fullyScheduled = 0
    let needsAttention = 0

    if (deadline) {
      const deadlineEvent = {
        id: `ai-deadline-${assessmentId}`,
        assessmentId,
        date: dateKey(deadline),
        title: assessmentTitle,
        meta: deadlineTime === null
          ? `${subject} - Assessment deadline`
          : `${subject} - Due at ${formatClockTime(deadlineTime)}`,
        tone: 'deadline',
        isDeadline: true,
        allDay: deadlineTime === null,
        ...(deadlineTime === null ? {} : { time: deadlineTime, duration: 0.5 }),
      }
      calendarEvents.push(deadlineEvent)
      if (deadlineTime !== null) occupiedEvents.push(deadlineEvent)
    }

    assessmentTasks.forEach((task, taskIndex) => {
      const taskId = task.id || `ai-task-${runId}-${assessmentIndex}-${taskIndex}`
      const taskTitle = task.title || `Work on ${assessmentTitle}`
      const estimatedMinutes = Math.max(1, Number(task.estimatedMinutes) || 30)
      let remainingMinutes = estimatedMinutes
      let status = 'Scheduled'
      let blockNumber = 1

      if (!deadline) {
        status = 'Needs deadline'
      } else if (deadline < today) {
        status = 'Deadline passed'
      } else {
        const lastStudyDate = deadlineTime === null && deadline > today
          ? addDays(deadline, -1)
          : deadline

        while (remainingMinutes > 0) {
          const blockMinutes = Math.min(remainingMinutes, maximumFocusBlockMinutes)
          const slot = findAvailableSlot(
            schedulingStartDate,
            lastStudyDate,
            blockMinutes,
            occupiedEvents,
            earliestStartTime,
            deadlineTime ?? studyDayEnd,
          )

          if (!slot) {
            status = 'Unscheduled'
            break
          }

          const event = {
            id: `ai-event-${taskId}-${blockNumber}`,
            assessmentId,
            taskId,
            blockNumber,
            date: slot.date,
            title: blockNumber === 1 ? taskTitle : `${taskTitle} - Part ${blockNumber}`,
            meta: `${assessmentTitle} - ${blockMinutes} min focus block`,
            time: slot.time,
            duration: slot.duration,
            tone,
          }

          calendarEvents.push(event)
          occupiedEvents.push(event)
          remainingMinutes -= blockMinutes
          blockNumber += 1
        }
      }

      if (status === 'Scheduled') fullyScheduled += 1
      else needsAttention += 1

      tasks.push({
        id: taskId,
        assessmentId,
        assessmentTitle,
        subject,
        tone,
        title: taskTitle,
        description: task.description ?? `${subject} - ${assessmentTitle}`,
        course: `${subject} - ${assessmentTitle}`,
        deadline: assessment.deadline,
        deadlineTime: assessment.deadlineTime || null,
        scheduleFrom: assessment.scheduleFrom || null,
        estimatedMinutes,
        due: formatDueDate(deadline, assessment.deadlineTime),
        priority: getPriority(deadline, today),
        status,
        done: false,
      })
    })

    reports.push({
      title: assessmentTitle,
      deadline: assessment.deadline,
      deadlineTime: assessment.deadlineTime || null,
      fullyScheduled,
      needsAttention,
      total: assessmentTasks.length,
    })
  })

  return { calendarEvents, tasks, reports }
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Course Flow AI">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>Course Flow <strong>AI</strong></span>
    </div>
  )
}

function SignUp({ onBack, onComplete }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  const submitSignUp = (event) => {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Use at least 6 characters for the prototype password.')
      return
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setPassword('')
    setConfirmPassword('')
    setIsComplete(true)
  }

  return (
    <main className="signup-page">
      <header className="signup-nav">
        <button type="button" onClick={onBack} aria-label="Return to Course Flow welcome page">
          <Brand />
        </button>
        <button className="signup-back" type="button" onClick={onBack}>← Back to home</button>
      </header>

      <section className="signup-layout">
        <div className="signup-story">
          <span className="section-kicker">Your week, organised</span>
          <h1>Make space for<br /><em>better work.</em></h1>
          <p>Create a pretend Course Flow account and see how the onboarding experience could feel.</p>
          <div className="signup-benefits" aria-label="Course Flow benefits">
            <span><i>1</i> Turn assessment instructions into clear tasks</span>
            <span><i>2</i> Schedule focus blocks around real deadlines</span>
            <span><i>3</i> Correct dates and details whenever plans change</span>
          </div>
        </div>

        <div className="signup-card">
          {isComplete ? (
            <div className="signup-success" role="status">
              <span className="success-mark" aria-hidden="true">✓</span>
              <span className="section-kicker">You're ready</span>
              <h2>Welcome, {name.trim() || 'student'}.</h2>
              <p>Your pretend account is ready. No information was saved or sent anywhere.</p>
              <button className="signup-submit" type="button" onClick={onComplete}>Start planning <span>→</span></button>
            </div>
          ) : (
            <>
              <div className="signup-card-heading">
                <span className="section-kicker">Start your flow</span>
                <h2>Create your account</h2>
                <p>This is a visual prototype—your details stay only in this form.</p>
              </div>
              <form className="signup-form" onSubmit={submitSignUp}>
                <label>
                  <span>Full name</span>
                  <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" autoComplete="name" required autoFocus />
                </label>
                <label>
                  <span>Email address</span>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@university.edu" autoComplete="email" required />
                </label>
                <div className="signup-passwords">
                  <label>
                    <span>Password</span>
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6+ characters" autoComplete="new-password" required />
                  </label>
                  <label>
                    <span>Confirm password</span>
                    <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat password" autoComplete="new-password" required />
                  </label>
                </div>
                {error && <p className="signup-error" role="alert">{error}</p>}
                <button className="signup-submit" type="submit">Create account <span>→</span></button>
                <p className="signup-privacy"><i aria-hidden="true">✦</i> Demo only. Credentials are not stored or submitted.</p>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function Landing({ onStart, onSignUp }) {
  return (
    <main className="landing">
      <header className="landing-nav">
        <Brand />
        <div className="landing-nav-actions">
          <span className="nav-note">Your study week, finally in flow.</span>
          <button className="signup-link" type="button" onClick={onSignUp}>Sign up</button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Built for busy students</div>
          <h1>Less chaos.<br />More <em>flow.</em></h1>
          <p className="hero-lede">
            Course Flow AI turns classes, assessments and deadlines into a study plan that makes sense.
          </p>
          <button className="primary-button" type="button" onClick={onStart}>
            <span>Start chatting</span>
            <span className="button-arrow" aria-hidden="true">→</span>
          </button>
          <p className="prototype-note">Try instantly, or explore the pretend sign-up experience.</p>
        </div>

        <div className="hero-visual" aria-label="Preview of a Course Flow study plan">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="preview-card">
            <div className="preview-card-head">
              <div>
                <span className="tiny-label">Your week</span>
                <h2>Good morning, Alex</h2>
              </div>
              <span className="preview-avatar">A</span>
            </div>
            <div className="preview-progress">
              <div className="progress-copy">
                <strong>3 of 5</strong>
                <span>tasks complete</span>
              </div>
              <div className="progress-track"><span /></div>
              <b>60%</b>
            </div>
            <div className="mini-days">
              {['M', 'T', 'W', 'T', 'F'].map((day, index) => (
                <div className={index === 2 ? 'is-active' : ''} key={`${day}-${index}`}>
                  <span>{day}</span>
                  <b>{10 + index}</b>
                  {index !== 3 && <i />}
                </div>
              ))}
            </div>
            <div className="next-block">
              <span className="block-time">10:30</span>
              <div className="block-line" />
              <div className="block-content">
                <span className="block-icon" aria-hidden="true">R</span>
                <div><strong>Research Methods</strong><small>Lecture · Room 204</small></div>
                <span className="more-mark">•••</span>
              </div>
            </div>
          </div>
          <div className="floating-task">
            <span className="floating-check" aria-hidden="true">✓</span>
            <div><small>Up next</small><strong>Quiz review</strong></div>
            <b>45m</b>
          </div>
          <div className="floating-spark" aria-hidden="true">✦</div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Plan with purpose</span>
        <span className="footer-line" />
        <span>Study with confidence</span>
        <span className="footer-line" />
        <span>Stay in flow</span>
      </footer>
    </main>
  )
}

function AppHeader({ activeTab, setActiveTab, onHome }) {
  return (
    <header className="app-header">
      <button className="brand-button" type="button" onClick={onHome} aria-label="Return to welcome screen">
        <Brand compact />
      </button>
      <nav className="app-tabs" aria-label="Main navigation">
        <button className={activeTab === 'chat' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('chat')}>
          <span className="tab-symbol" aria-hidden="true">◌</span> Chat
        </button>
        <button className={activeTab === 'flow' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('flow')}>
          <span className="tab-symbol tab-grid" aria-hidden="true">▦</span> Course Flow
        </button>
      </nav>
      <div className="header-actions">
        <button className="icon-button" type="button" aria-label="Notifications"><span aria-hidden="true">•</span></button>
        <span className="user-avatar" aria-label="Alex's profile">A</span>
      </div>
    </header>
  )
}

function ChatView({ onPublishAssessments }) {
    const [messages, setMessages] = useState(starterMessages)
    const [draft, setDraft] = useState('')
    const [isListening, setIsListening] = useState(false)
    const [voiceStatus, setVoiceStatus] = useState(null)
    const recognitionRef = useRef(null)
    const voiceBaseDraftRef = useRef('')
    const finalTranscriptRef = useRef('')

    const [isAnalysing, setIsAnalysing] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => () => {
        recognitionRef.current?.abort()
    }, [])

    const stopListening = () => {
        if (!recognitionRef.current) return
        setVoiceStatus({
            type: 'listening',
            title: 'Finishing transcription',
            detail: 'Preparing the captured text…',
        })
        recognitionRef.current.stop()
    }

    const toggleVoiceRecognition = () => {
        if (isListening) {
            stopListening()
            return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            setVoiceStatus({
                type: 'error',
                title: 'Voice recognition is unavailable',
                detail: 'Try the latest Chrome or Edge browser.',
            })
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = navigator.language || 'en-AU'
        recognitionRef.current = recognition
        voiceBaseDraftRef.current = draft.trim()
        finalTranscriptRef.current = ''

        recognition.onstart = () => {
            setIsListening(true)
            setVoiceStatus({
                type: 'listening',
                title: 'Listening…',
                detail: 'Speak naturally. Tap the microphone again when finished.',
            })
        }

        recognition.onresult = (event) => {
            let interimTranscript = ''

            for (let index = event.resultIndex; index < event.results.length; index += 1) {
                const transcript = event.results[index][0].transcript.trim()
                if (!transcript) continue

                if (event.results[index].isFinal) {
                    finalTranscriptRef.current = `${finalTranscriptRef.current} ${transcript}`.trim()
                } else {
                    interimTranscript = `${interimTranscript} ${transcript}`.trim()
                }
            }

            setDraft([
                voiceBaseDraftRef.current,
                finalTranscriptRef.current,
                interimTranscript,
            ].filter(Boolean).join(' '))
        }

        recognition.onerror = (event) => {
            const messagesByError = {
                'not-allowed': 'Microphone permission was denied. Allow microphone access and try again.',
                'service-not-allowed': 'Speech recognition access is blocked by this browser.',
                'audio-capture': 'No working microphone was detected.',
                'no-speech': 'No speech was detected. Tap the microphone and try again.',
                network: 'The browser speech service could not be reached.',
            }

            setVoiceStatus({
                type: 'error',
                title: 'Voice capture stopped',
                detail: messagesByError[event.error] || 'Something interrupted speech recognition. Please try again.',
            })
            setIsListening(false)
        }

        recognition.onend = () => {
            recognitionRef.current = null
            setIsListening(false)
            setVoiceStatus((current) => current?.type === 'error'
                ? current
                : {
                    type: 'success',
                    title: 'Voice message captured',
                    detail: 'Review the transcript, then press Send.',
                })
        }

        try {
            recognition.start()
        } catch {
            recognitionRef.current = null
            setVoiceStatus({
                type: 'error',
                title: 'Voice recognition could not start',
                detail: 'Wait a moment and try the microphone again.',
            })
        }
    }

    const sendMessage = async (event) => {
        event.preventDefault()

        if (isListening) {
            stopListening()
            return
        }

        const cleanDraft = draft.trim()

        if (!cleanDraft || isAnalysing) return

        setMessages((current) => [
            ...current,
            {
                id: Date.now(),
                role: 'user',
                text: cleanDraft,
            },
        ])

        setDraft('')
        setError(null)
        setVoiceStatus(null)
        setIsAnalysing(true)

        try {
            const response = await fetch(
                'http://127.0.0.1:5011/api/analyze',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        instructions: cleanDraft,
                        currentDate: dateKey(new Date()),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                        locale: navigator.language || 'en',
                    }),
                },
            )

            if (!response.ok) {
                const problem = await response.json().catch(() => null)
                throw new Error(problem?.detail || 'The assignment could not be analysed.')
            }

            const result = await response.json()
            const assessments = Array.isArray(result.assessments)
                ? result.assessments
                : [result]

            if (!assessments.length) {
                throw new Error('No assessments were found in that message.')
            }

            const reports = onPublishAssessments(assessments)
            const summary = reports.map((report, index) => {
                const scheduledText = `${report.fullyScheduled}/${report.total} tasks scheduled`
                const attentionText = report.needsAttention
                    ? `; ${report.needsAttention} need attention`
                    : ''
                const deadlineText = report.deadline
                    ? `; ${formatDueDate(parseDateKey(report.deadline), report.deadlineTime)} added to calendar`
                    : ''
                return `${index + 1}. ${report.title} - ${scheduledText}${attentionText}${deadlineText}`
            }).join('\n')

            setMessages((current) => [
                ...current,
                {
                    id: `${Date.now()}-assistant`,
                    role: 'assistant',
                    text: `Added ${assessments.length} assessment${assessments.length === 1 ? '' : 's'} to Course Flow in order:\n${summary}\n\nOpen the Course Flow tab to see the calendar and tasks.`,
                },
            ])
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Something went wrong.',
            )
        } finally {
            setIsAnalysing(false)
        }
    }
  const selectSuggestion = (suggestion) => setDraft(suggestion)

  return (
    <section className="chat-view">
      <div className="chat-wrap">
        <div className="chat-heading">
          <span className="assistant-orb" aria-hidden="true"><i>✦</i></span>
          <div>
            <span className="online-label"><i /> Course Flow assistant</span>
            <h1>What can we plan today?</h1>
            <p>Start with a deadline, a subject, or anything that feels overwhelming.</p>
          </div>
        </div>
        <div className="conversation" aria-live="polite">
            {messages.map((message) => (
                <div
                    className={`message-row message-row--${message.role}`}
                    key={message.id}
                >
                {message.role === 'assistant' && (
                    <span className="message-avatar" aria-hidden="true">
                        ✦
                    </span>
                )}

                    <div className="message-bubble">
                        {message.text}
                    </div>
                </div>
            ))}

            {isAnalysing && (
                <div className="message-row message-row--assistant">
                    <span className="message-avatar" aria-hidden="true">
                        ✦
                    </span>

                    <div className="message-bubble">
                        Analysing assignment…
                    </div>
                </div>
            )}

            {error && (
                <div className="message-row message-row--assistant">
                    <div className="message-bubble error-message">
                        {error}
                    </div>
                </div>
            )}

        </div>

        {messages.length === 1 && (
          <div className="suggestion-list" aria-label="Message suggestions">
            {suggestions.map((suggestion) => (
              <button type="button" key={suggestion} onClick={() => selectSuggestion(suggestion)}>
                {suggestion}<span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        )}

      <form className="composer" onSubmit={sendMessage}>
          <button className="add-button" type="button" aria-label="Add an attachment"><span aria-hidden="true">＋</span></button>
          <label className="sr-only" htmlFor="chat-message">Message Course Flow</label>
          <textarea
            id="chat-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) sendMessage(event)
            }}
            rows="1"
            placeholder="Message Course Flow..."
          />
          <div className="voice-control">
            <button
              className={`voice-button ${isListening ? 'is-active is-listening' : ''}`}
              type="button"
              onClick={toggleVoiceRecognition}
              disabled={isAnalysing}
              aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
              aria-pressed={isListening}
            >
              <span className="mic-icon" aria-hidden="true" />
            </button>
            <span className="voice-tooltip" aria-hidden="true">{isListening ? 'Stop listening' : 'Start voice message'}</span>
          </div>
          <button className="send-button" type="submit" disabled={!draft.trim() || isAnalysing || isListening} aria-label="Send message"><span aria-hidden="true">↑</span></button>
        </form>
        {voiceStatus && (
          <div className={`voice-notice voice-notice--${voiceStatus.type}`} role="status" aria-live="polite">
            <span className="notice-spark" aria-hidden="true">{voiceStatus.type === 'listening' ? '●' : voiceStatus.type === 'error' ? '!' : '✓'}</span>
            <div><strong>{voiceStatus.title}</strong><small>{voiceStatus.detail}</small></div>
            <button type="button" onClick={() => setVoiceStatus(null)} aria-label="Dismiss voice recognition status">×</button>
          </div>
        )}
        <p className="chat-disclaimer"><span>✦</span> Voice recognition is handled by your browser. Review transcripts before sending.</p>
      </div>
    </section>
  )
}

function WeekCalendar({ anchorDate, selectedDate, onSelectDate, onSelectEvent, events }) {
  const today = new Date()
  const weekStart = startOfWeek(anchorDate)
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))

  return (
    <div className="calendar calendar--week">
      <div className="calendar-days">
        <div className="time-spacer" />
        {days.map((date, index) => (
          <button
            type="button"
            className={`calendar-day-head ${isSameDay(date, today) ? 'is-today' : ''} ${isSameDay(date, selectedDate) ? 'is-selected' : ''}`}
            key={dateKey(date)}
            onClick={() => onSelectDate(date)}
            aria-pressed={isSameDay(date, selectedDate)}
            aria-label={`Select ${fullDayNames[index]} ${date.getDate()} ${monthNames[date.getMonth()]}`}
          >
            <span>{dayNames[index]}</span><b>{date.getDate()}</b>
          </button>
        ))}
      </div>
      <div className="calendar-deadlines" aria-label="Assessment deadlines">
        <span className="deadline-label">Due</span>
        {days.map((date) => (
          <div className="deadline-day" key={dateKey(date)}>
            {events
              .filter((event) => event.allDay && event.date === dateKey(date))
              .map((event) => (
                <button
                  type="button"
                  className="deadline-event"
                  key={event.id}
                  onClick={() => onSelectEvent(event, date)}
                  aria-label={`${event.title}, due ${date.getDate()} ${monthNames[date.getMonth()]}`}
                >
                  <span aria-hidden="true">!</span>{event.title}
                </button>
              ))}
          </div>
        ))}
      </div>
      <div className="calendar-body">
        <div className="time-rail" aria-hidden="true">
          {calendarTimeLabels.map((time) => <span key={time}>{time}</span>)}
        </div>
        {days.map((date) => {
          const dayEvents = events.filter((event) => event.date === dateKey(date) && !event.allDay)
          return (
            <div className={`calendar-column ${isSameDay(date, selectedDate) ? 'is-selected' : ''}`} key={dateKey(date)}>
              {[0, 1, 2, 3].map((slot) => (
                <button
                  type="button"
                  className="calendar-slot"
                  key={slot}
                  onClick={() => onSelectDate(date)}
                  aria-label={`Select ${fullDayNames[(date.getDay() + 6) % 7]}`}
                />
              ))}
              {dayEvents.map((event) => (
                <button
                  type="button"
                  className={`calendar-event calendar-event--${event.tone}`}
                  style={{
                    '--event-top': `${Math.min(94, Math.max(0, ((event.time - calendarDayStart) / (calendarDayEnd - calendarDayStart)) * 100))}%`,
                    '--event-height': `${Math.max(6, (event.duration / (calendarDayEnd - calendarDayStart)) * 100)}%`,
                  }}
                  key={event.id}
                  onClick={() => onSelectEvent(event, date)}
                  aria-label={`${event.title}, ${formatClockTime(event.time)}, ${event.meta}`}
                >
                  <span className="event-dot" />
                  <strong>{event.title}</strong>
                  <small>{formatClockTime(event.time)} · {event.meta}</small>
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthCalendar({ anchorDate, selectedDate, onSelectDate, onSelectEvent, events }) {
  const today = new Date()
  const firstOfMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1)
  const gridStart = startOfWeek(firstOfMonth)
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))

  return (
    <div className="calendar calendar--month">
      <div className="month-weekdays" aria-hidden="true">
        {dayNames.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="month-grid">
        {days.map((date) => {
          const dayEvents = events
            .filter((event) => event.date === dateKey(date))
            .sort((first, second) => Number(second.allDay) - Number(first.allDay))
          const outsideMonth = date.getMonth() !== anchorDate.getMonth()
          return (
            <div
              className={`month-cell ${outsideMonth ? 'is-outside' : ''} ${isSameDay(date, today) ? 'is-today' : ''} ${isSameDay(date, selectedDate) ? 'is-selected' : ''}`}
              key={dateKey(date)}
            >
              <button
                type="button"
                className="month-date-button"
                onClick={() => onSelectDate(date)}
                aria-pressed={isSameDay(date, selectedDate)}
                aria-label={`Select ${date.getDate()} ${monthNames[date.getMonth()]}, ${dayEvents.length} scheduled items`}
              >
                <span className="month-date">{date.getDate()}</span>
              </button>
              <span className="month-events">
                {dayEvents.slice(0, 2).map((event) => (
                  <button
                    type="button"
                    className={`month-event month-event--${event.tone}`}
                    key={event.id}
                    onClick={() => onSelectEvent(event, date)}
                  >
                    <i />{event.title}
                  </button>
                ))}
                {dayEvents.length > 2 && <small>+{dayEvents.length - 2} more</small>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CalendarAgenda({ selectedDate, selectedEvent, onSelectEvent, onCloseEvent, events }) {
  const dayEvents = events
    .filter((event) => event.date === dateKey(selectedDate))
    .sort((first, second) => Number(second.allDay) - Number(first.allDay))
  const dayIndex = (selectedDate.getDay() + 6) % 7

  if (selectedEvent) {
    return (
      <div className="event-detail" aria-live="polite">
        <span className={`detail-icon detail-icon--${selectedEvent.tone}`} aria-hidden="true">●</span>
        <div className="detail-copy">
          <span>{fullDayNames[dayIndex]}, {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}</span>
          <h3>{selectedEvent.title}</h3>
          <p>
            {selectedEvent.allDay
              ? 'Due this day'
              : selectedEvent.isDeadline
                ? `Due at ${formatClockTime(selectedEvent.time)}`
              : `${formatClockTime(selectedEvent.time)} - ${formatClockTime(selectedEvent.time + selectedEvent.duration)}`}
            <i /> {selectedEvent.meta}
          </p>
        </div>
        <button type="button" onClick={onCloseEvent} aria-label="Close event details">×</button>
      </div>
    )
  }

  return (
    <div className="day-agenda">
      <div className="agenda-date">
        <span>{fullDayNames[dayIndex]}</span>
        <strong>{selectedDate.getDate()}</strong>
        <small>{monthNames[selectedDate.getMonth()]}</small>
      </div>
      <div className="agenda-items">
        {dayEvents.length ? dayEvents.map((event) => (
          <button type="button" key={event.id} onClick={() => onSelectEvent(event, selectedDate)}>
            <i className={`agenda-dot agenda-dot--${event.tone}`} />
            <span><strong>{event.title}</strong><small>{event.meta}</small></span>
            <b>{event.allDay ? 'Deadline' : formatClockTime(event.time)}</b>
          </button>
        )) : <p>Nothing scheduled — a good day for a focus block.</p>}
      </div>
    </div>
  )
}

function ManualTaskForm({ onCreate, onCancel }) {
  const [subject, setSubject] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [deadlineTime, setDeadlineTime] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(60)

  const submitTask = (event) => {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return

    onCreate({
      subject: subject.trim() || 'Personal study',
      title: cleanTitle,
      description: description.trim(),
      deadline: deadline || null,
      deadlineTime: deadline ? deadlineTime || null : null,
      estimatedMinutes: Math.min(1440, Math.max(15, Number(estimatedMinutes) || 60)),
    })
  }

  return (
    <section className="manual-task-panel" role="dialog" aria-labelledby="manual-task-title">
      <div className="manual-task-heading">
        <div>
          <span className="section-kicker">Manual mode</span>
          <h2 id="manual-task-title">Add a task without AI</h2>
        </div>
        <button type="button" onClick={onCancel} aria-label="Close manual task form">×</button>
      </div>
      <form className="manual-task-form" onSubmit={submitTask}>
        <label>
          <span>Course or subject</span>
          <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Computer Networks" />
        </label>
        <label>
          <span>Task title *</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Complete Lab 4 report" autoFocus required />
        </label>
        <label className="manual-task-description">
          <span>Description</span>
          <textarea rows="3" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What needs to be completed?" />
        </label>
        <label>
          <span>Deadline</span>
          <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        </label>
        <label>
          <span>Deadline time</span>
          <input type="time" value={deadlineTime} onChange={(event) => setDeadlineTime(event.target.value)} disabled={!deadline} />
        </label>
        <label>
          <span>Estimated minutes</span>
          <input type="number" min="15" max="1440" step="15" value={estimatedMinutes} onChange={(event) => setEstimatedMinutes(event.target.value)} />
        </label>
        <p className="manual-task-note">No deadline? The task will be added as “Needs deadline” without a calendar block.</p>
        <div className="manual-task-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={!title.trim()}>Add and schedule</button>
        </div>
      </form>
    </section>
  )
}

function TaskItem({ task, onToggle, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || task.course || '')
  const [editDeadline, setEditDeadline] = useState(task.deadline || '')
  const [editDeadlineTime, setEditDeadlineTime] = useState(task.deadlineTime || '')
  const [editPriority, setEditPriority] = useState(task.priority || 'Medium')

  const startEditing = () => {
    setEditTitle(task.title)
    setEditDescription(task.description || task.course || '')
    setEditDeadline(task.deadline || '')
    setEditDeadlineTime(task.deadlineTime || '')
    setEditPriority(task.priority || 'Medium')
    setIsEditing(true)
  }

  const saveTask = (event) => {
    event.preventDefault()
    const title = editTitle.trim()
    if (!title) return

    onSave(task.id, {
      title,
      description: editDescription.trim(),
      deadline: editDeadline || null,
      deadlineTime: editDeadline ? editDeadlineTime || null : null,
      priority: editPriority,
    })
    setIsEditing(false)
  }

  return (
    <article className={`task-item ${task.done ? 'is-done' : ''} ${isEditing ? 'is-editing' : ''}`}>
      <button type="button" className="task-check" onClick={() => onToggle(task.id)} aria-label={`${task.done ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`}>
        {task.done && <span aria-hidden="true">✓</span>}
      </button>
      {isEditing ? (
        <form className="task-edit-form" onSubmit={saveTask}>
          <label>
            <span>Task title</span>
            <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} autoFocus />
          </label>
          <label>
            <span>Description</span>
            <textarea rows="2" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} />
          </label>
          <label>
            <span>Deadline</span>
            <input type="date" value={editDeadline} onChange={(event) => setEditDeadline(event.target.value)} />
          </label>
          <label>
            <span>Deadline time</span>
            <input type="time" value={editDeadlineTime} onChange={(event) => setEditDeadlineTime(event.target.value)} disabled={!editDeadline} />
          </label>
          <label>
            <span>Priority level</span>
            <select value={editPriority} onChange={(event) => setEditPriority(event.target.value)}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
          <div className="task-edit-actions">
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" disabled={!editTitle.trim()}>Save changes</button>
          </div>
        </form>
      ) : (
        <>
          <div className="task-copy">
            <h3>{task.title}</h3>
            <p>{task.description || task.course}</p>
            <div className="task-meta">
              <span className={`priority priority--${task.priority.toLowerCase()}`}>{task.priority}</span>
              {task.status && (
                <span className={`task-status task-status--${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {task.status}
                </span>
              )}
              <span>{task.due}</span>
            </div>
          </div>
          <button className="task-more" type="button" onClick={startEditing} aria-label={`Edit ${task.title}`}>Edit</button>
        </>
      )}
    </article>
  )
}

function FlowView({ calendarEvents, tasks, setTasks, onSaveTask, onAddTask }) {
  const [calendarView, setCalendarView] = useState('week')
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isAddingTask, setIsAddingTask] = useState(false)

  const toggleTask = (taskId) => {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, done: !task.done } : task))
  }

  const saveTaskEdit = (taskId, changes) => {
    onSaveTask(taskId, changes)
    setSelectedEvent(null)
  }

  const createManualTask = (details) => {
    onAddTask(details)
    setIsAddingTask(false)
    setSelectedEvent(null)

    const deadline = parseDateKey(details.deadline)
    if (deadline) {
      setAnchorDate(deadline)
      setSelectedDate(deadline)
    }
  }

  const completeCount = tasks.filter((task) => task.done).length
  const weekStart = startOfWeek(anchorDate)
  const weekEnd = addDays(weekStart, 6)
  const periodLabel = calendarView === 'month'
    ? `${monthNames[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`
    : weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getDate()} – ${weekEnd.getDate()} ${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`
      : `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} – ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`

  const changePeriod = (direction) => {
    const nextDate = calendarView === 'week'
      ? addDays(anchorDate, direction * 7)
      : addMonths(anchorDate, direction)
    setAnchorDate(nextDate)
    setSelectedDate(nextDate)
    setSelectedEvent(null)
  }

  const goToToday = () => {
    const today = new Date()
    setAnchorDate(today)
    setSelectedDate(today)
    setSelectedEvent(null)
  }

  const selectDate = (date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    if (calendarView === 'month' && date.getMonth() !== anchorDate.getMonth()) setAnchorDate(date)
  }

  const selectEvent = (event, date) => {
    setSelectedDate(date)
    setSelectedEvent(event)
  }

  const changeView = (view) => {
    setCalendarView(view)
    setAnchorDate(selectedDate)
    setSelectedEvent(null)
  }

  return (
    <section className="flow-view">
      <div className="flow-heading">
        <div>
          <span className="section-kicker">Your study plan</span>
          <h1>Course Flow</h1>
          <p>Everything on your plate, mapped into a week you can manage.</p>
        </div>
        <button
          className="add-task-button"
          type="button"
          onClick={() => setIsAddingTask((current) => !current)}
          aria-expanded={isAddingTask}
        >
          <span aria-hidden="true">＋</span> {isAddingTask ? 'Close' : 'Add task'}
        </button>
      </div>

      {isAddingTask && (
        <ManualTaskForm onCreate={createManualTask} onCancel={() => setIsAddingTask(false)} />
      )}

      <div className="flow-layout">
        <div className="schedule-panel">
          <div className="panel-head">
            <div className="week-controls">
              <button type="button" onClick={() => changePeriod(-1)} aria-label={`Previous ${calendarView}`}>‹</button>
              <h2>{periodLabel}</h2>
              <button type="button" onClick={() => changePeriod(1)} aria-label={`Next ${calendarView}`}>›</button>
              <button className="today-button" type="button" onClick={goToToday}>Today</button>
            </div>
            <div className="view-switch" aria-label="Calendar view">
              <button className={calendarView === 'week' ? 'is-active' : ''} type="button" onClick={() => changeView('week')} aria-pressed={calendarView === 'week'}>Week</button>
              <button className={calendarView === 'month' ? 'is-active' : ''} type="button" onClick={() => changeView('month')} aria-pressed={calendarView === 'month'}>Month</button>
            </div>
          </div>
          {calendarView === 'week' ? (
            <WeekCalendar
              anchorDate={anchorDate}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
              onSelectEvent={selectEvent}
              events={calendarEvents}
            />
          ) : (
            <MonthCalendar
              anchorDate={anchorDate}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
              onSelectEvent={selectEvent}
              events={calendarEvents}
            />
          )}
          <CalendarAgenda
            selectedDate={selectedDate}
            selectedEvent={selectedEvent}
            onSelectEvent={selectEvent}
            onCloseEvent={() => setSelectedEvent(null)}
            events={calendarEvents}
          />
          <div className="calendar-legend">
            <span><i className="legend-blue" />Class</span>
            <span><i className="legend-peach" />Focus block</span>
            <span><i className="legend-mint" />Workshop</span>
            <span><i className="legend-deadline" />Deadline</span>
          </div>
        </div>

        <aside className="tasks-panel">
          <div className="tasks-head">
            <div><span className="section-kicker">This week</span><h2>Tasks</h2></div>
            <span className="task-count">{tasks.length - completeCount} left</span>
          </div>
          <div className="completion-card">
            <div><strong>{completeCount}/{tasks.length}</strong><span>completed</span></div>
            <div className="completion-track"><span style={{ width: `${tasks.length ? (completeCount / tasks.length) * 100 : 0}%` }} /></div>
          </div>
          <div className="task-list">
            {tasks.map((task) => (
              <TaskItem task={task} onToggle={toggleTask} onSave={saveTaskEdit} key={task.id} />
            ))}
          </div>
          <button className="view-all-button" type="button">View all tasks <span aria-hidden="true">→</span></button>
        </aside>
      </div>
    </section>
  )
}

function App() {
  const [screen, setScreen] = useState('landing')
  const [activeTab, setActiveTab] = useState('chat')
  const [demoSchedule] = useState(() => scheduleAssessments(createDemoAssessments(), []))
  const [calendarEvents, setCalendarEvents] = useState(demoSchedule.calendarEvents)
  const [tasks, setTasks] = useState(demoSchedule.tasks)

  const startChat = () => {
    setActiveTab('chat')
    setScreen('workspace')
  }

  const publishAssessments = (assessments) => {
    const publication = scheduleAssessments(assessments, calendarEvents)

    setCalendarEvents((current) => [...current, ...publication.calendarEvents])
    setTasks((current) => [...current, ...publication.tasks])

    return publication.reports
  }

  const addManualTask = (details) => {
    const manualId = Date.now()
    const publication = scheduleAssessments([
      {
        id: `manual-assessment-${manualId}`,
        assessmentTitle: details.title,
        subject: details.subject,
        deadline: details.deadline,
        deadlineTime: details.deadlineTime,
        tone: 'peach',
        tasks: [
          {
            id: `manual-task-${manualId}`,
            title: details.title,
            description: details.description,
            estimatedMinutes: details.estimatedMinutes,
          },
        ],
      },
    ], calendarEvents)

    setCalendarEvents((current) => [...current, ...publication.calendarEvents])
    setTasks((current) => [...current, ...publication.tasks])

    return publication
  }

  const saveTask = (taskId, changes) => {
    const target = tasks.find((task) => task.id === taskId)
    if (!target) return

    const nextDeadline = changes.deadline || null
    const nextDeadlineTime = nextDeadline ? changes.deadlineTime || null : null
    const nextPriority = ['High', 'Medium', 'Low'].includes(changes.priority)
      ? changes.priority
      : target.priority
    const deadlineChanged = (target.deadline || null) !== nextDeadline
      || (target.deadlineTime || null) !== nextDeadlineTime
    const titleChanged = target.title !== changes.title

    if (!target.assessmentId || !deadlineChanged) {
      const deadlineDate = parseDateKey(nextDeadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      setTasks((current) => current.map((task) => task.id === taskId
        ? {
            ...task,
            ...changes,
            deadline: nextDeadline,
            deadlineTime: nextDeadlineTime,
            due: formatDueDate(deadlineDate, nextDeadlineTime),
            priority: nextPriority,
          }
        : task))

      if (titleChanged && target.assessmentId) {
        setCalendarEvents((current) => current.map((event) => {
          if (event.taskId !== taskId) return event
          return {
            ...event,
            title: event.blockNumber > 1
              ? `${changes.title} - Part ${event.blockNumber}`
              : changes.title,
          }
        }))
      }
      return
    }

    const assessmentTasks = tasks.filter((task) => task.assessmentId === target.assessmentId)
    const revisedAssessment = {
      id: target.assessmentId,
      assessmentTitle: target.assessmentTitle,
      subject: target.subject,
      deadline: nextDeadline,
      deadlineTime: nextDeadlineTime,
      scheduleFrom: target.scheduleFrom,
      tone: target.tone,
      tasks: assessmentTasks.map((task) => ({
        id: task.id,
        title: task.id === taskId ? changes.title : task.title,
        description: task.id === taskId ? changes.description : task.description,
        estimatedMinutes: task.estimatedMinutes,
      })),
    }
    const otherEvents = calendarEvents.filter((event) => event.assessmentId !== target.assessmentId)
    const publication = scheduleAssessments([revisedAssessment], otherEvents)
    const replacements = new Map(publication.tasks.map((task) => [task.id, task]))

    setCalendarEvents([...otherEvents, ...publication.calendarEvents])
    setTasks((current) => current.map((task) => {
      const replacement = replacements.get(task.id)
      return replacement
        ? {
            ...replacement,
            done: task.done,
            priority: task.id === taskId ? nextPriority : replacement.priority,
          }
        : task
    }))
  }

  if (screen === 'landing') {
    return <Landing onStart={startChat} onSignUp={() => setScreen('signup')} />
  }

  if (screen === 'signup') {
    return <SignUp onBack={() => setScreen('landing')} onComplete={startChat} />
  }

  return (
    <main className="workspace">
      <AppHeader activeTab={activeTab} setActiveTab={setActiveTab} onHome={() => setScreen('landing')} />
      {activeTab === 'chat' ? (
        <ChatView onPublishAssessments={publishAssessments} />
      ) : (
        <FlowView
          calendarEvents={calendarEvents}
          tasks={tasks}
          setTasks={setTasks}
          onSaveTask={saveTask}
          onAddTask={addManualTask}
        />
      )}
    </main>
  )
}

export default App
