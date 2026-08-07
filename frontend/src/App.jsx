import { useState } from 'react'
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

// Static array, needs to be a list
// 
const calendarEvents = [
  { id: 1, date: '2026-08-03', title: 'Research Methods', meta: 'Lecture · Room 204', time: 9.5, duration: 1.5, tone: 'blue' },
  { id: 2, date: '2026-08-03', title: 'Quiz review', meta: '45 min focus block', time: 14, duration: 0.75, tone: 'peach' },
  { id: 3, date: '2026-08-04', title: 'Algorithms', meta: 'Workshop · Lab 3', time: 10.5, duration: 1.5, tone: 'mint' },
  { id: 4, date: '2026-08-04', title: 'Draft introduction', meta: '90 min focus block', time: 14.5, duration: 1.5, tone: 'blue' },
  { id: 5, date: '2026-08-05', title: 'Design Studio', meta: 'Tutorial · Building A', time: 11, duration: 2, tone: 'lilac' },
  { id: 6, date: '2026-08-06', title: 'Algorithms', meta: 'Lecture · Theatre 1', time: 9, duration: 1.5, tone: 'mint' },
  { id: 7, date: '2026-08-06', title: 'Case study research', meta: '60 min focus block', time: 13.5, duration: 1, tone: 'lilac' },
  { id: 8, date: '2026-08-07', title: 'Weekly review', meta: 'Plan next steps', time: 11, duration: 1, tone: 'peach' },
  { id: 9, date: '2026-08-07', title: 'Submit quiz', meta: 'Due · 4:00 PM', time: 16, duration: 1, tone: 'blue' },
  { id: 10, date: '2026-08-10', title: 'Research Methods', meta: 'Lecture · Room 204', time: 9.5, duration: 1.5, tone: 'blue' },
  { id: 11, date: '2026-08-11', title: 'Algorithms', meta: 'Workshop · Lab 3', time: 10.5, duration: 1.5, tone: 'mint' },
  { id: 12, date: '2026-08-12', title: 'Design Studio', meta: 'Tutorial · Building A', time: 11, duration: 2, tone: 'lilac' },
  { id: 13, date: '2026-08-12', title: 'Team check-in', meta: 'Online meeting', time: 14.5, duration: 1, tone: 'peach' },
  { id: 14, date: '2026-08-13', title: 'Case study research', meta: '60 min focus block', time: 13, duration: 1, tone: 'lilac' },
  { id: 15, date: '2026-08-14', title: 'Submit quiz', meta: 'Assessment deadline', time: 16, duration: 1, tone: 'blue' },
  { id: 16, date: '2026-08-18', title: 'Project checkpoint', meta: 'Online · Teams', time: 11, duration: 1, tone: 'peach' },
  { id: 17, date: '2026-08-20', title: 'Design critique', meta: 'Studio · Building A', time: 13, duration: 2, tone: 'lilac' },
  { id: 18, date: '2026-08-27', title: 'Research proposal', meta: 'Assessment deadline', time: 17, duration: 1, tone: 'blue' },
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

// needs to be a list
const initialTasks = [
  { id: 1, title: 'Research proposal', course: 'Research Methods', due: 'Today, 5:00 PM', priority: 'High', done: false },
  { id: 2, title: 'Algorithm quiz', course: 'Algorithms', due: 'Friday, 4:00 PM', priority: 'Medium', done: false },
  { id: 3, title: 'Case study outline', course: 'Design Studio', due: 'Sunday, 11:59 PM', priority: 'Medium', done: false },
  { id: 4, title: 'Read chapter 6', course: 'Research Methods', due: 'Next Monday', priority: 'Low', done: true },
]

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

function Landing({ onStart }) {
  return (
    <main className="landing">
      <header className="landing-nav">
        <Brand />
        <span className="nav-note">Your study week, finally in flow.</span>
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
          <p className="prototype-note">A visual prototype — no sign-up needed</p>
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

function ChatView() {
    const [messages, setMessages] = useState(starterMessages)
    const [draft, setDraft] = useState('')
    const [voiceNotice, setVoiceNotice] = useState(false)

    const [isAnalysing, setIsAnalysing] = useState(false)
    const [error, setError] = useState(null)
    const [analysis, setAnalysis] = useState(null)

    const sendMessage = async (event) => {
        event.preventDefault()

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
                    }),
                },
            )

            if (!response.ok) {
                throw new Error('The assignment could not be analysed.')
            }

            const result = await response.json()

            setAnalysis(result)
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

            {analysis && (
                <pre className="message-bubble">
                    {JSON.stringify(analysis, null, 2)}
                </pre>
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
              className={`voice-button ${voiceNotice ? 'is-active' : ''}`}
              type="button"
              onClick={() => setVoiceNotice((current) => !current)}
              aria-label="Voice recognition coming soon"
              aria-pressed={voiceNotice}
            >
              <span className="mic-icon" aria-hidden="true" />
            </button>
            <span className="voice-tooltip" aria-hidden="true">{voiceNotice ? 'Close message' : 'Voice coming soon'}</span>
          </div>
          <button className="send-button" type="submit" disabled={!draft.trim()} aria-label="Send message"><span aria-hidden="true">↑</span></button>
        </form>
        {voiceNotice && (
          <div className="voice-notice" role="status">
            <span className="notice-spark" aria-hidden="true">✦</span>
            <div><strong>Voice recognition is coming soon</strong><small>The microphone is not connected yet.</small></div>
            <button type="button" onClick={() => setVoiceNotice(false)} aria-label="Dismiss voice recognition message">×</button>
          </div>
        )}
        <p className="chat-disclaimer"><span>✦</span> Interface preview only — AI responses will be connected later.</p>
      </div>
    </section>
  )
}

function WeekCalendar({ anchorDate, selectedDate, onSelectDate, onSelectEvent }) {
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
      <div className="calendar-body">
        <div className="time-rail" aria-hidden="true">
          {['8 AM', '10 AM', '12 PM', '2 PM', '4 PM'].map((time) => <span key={time}>{time}</span>)}
        </div>
        {days.map((date) => {
          const dayEvents = calendarEvents.filter((event) => event.date === dateKey(date))
          return (
            <div className={`calendar-column ${isSameDay(date, selectedDate) ? 'is-selected' : ''}`} key={dateKey(date)}>
              {[0, 1, 2, 3, 4].map((slot) => (
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
                    '--event-top': `${Math.max(0, ((event.time - 8) / 10) * 100)}%`,
                    '--event-height': `${Math.max(10, (event.duration / 10) * 100)}%`,
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

function MonthCalendar({ anchorDate, selectedDate, onSelectDate, onSelectEvent }) {
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
          const dayEvents = calendarEvents.filter((event) => event.date === dateKey(date))
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

function CalendarAgenda({ selectedDate, selectedEvent, onSelectEvent, onCloseEvent }) {
  const events = calendarEvents.filter((event) => event.date === dateKey(selectedDate))
  const dayIndex = (selectedDate.getDay() + 6) % 7

  if (selectedEvent) {
    return (
      <div className="event-detail" aria-live="polite">
        <span className={`detail-icon detail-icon--${selectedEvent.tone}`} aria-hidden="true">●</span>
        <div className="detail-copy">
          <span>{fullDayNames[dayIndex]}, {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}</span>
          <h3>{selectedEvent.title}</h3>
          <p>{formatClockTime(selectedEvent.time)} – {formatClockTime(selectedEvent.time + selectedEvent.duration)} <i /> {selectedEvent.meta}</p>
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
        {events.length ? events.map((event) => (
          <button type="button" key={event.id} onClick={() => onSelectEvent(event, selectedDate)}>
            <i className={`agenda-dot agenda-dot--${event.tone}`} />
            <span><strong>{event.title}</strong><small>{event.meta}</small></span>
            <b>{formatClockTime(event.time)}</b>
          </button>
        )) : <p>Nothing scheduled — a good day for a focus block.</p>}
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle }) {
  return (
    <article className={`task-item ${task.done ? 'is-done' : ''}`}>
      <button type="button" className="task-check" onClick={() => onToggle(task.id)} aria-label={`${task.done ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`}>
        {task.done && <span aria-hidden="true">✓</span>}
      </button>
      <div className="task-copy">
        <h3>{task.title}</h3>
        <p>{task.course}</p>
        <div className="task-meta">
          <span className={`priority priority--${task.priority.toLowerCase()}`}>{task.priority}</span>
          <span>{task.due}</span>
        </div>
      </div>
      <button className="task-more" type="button" aria-label={`More options for ${task.title}`}>•••</button>
    </article>
  )
}

function FlowView() {
  const [tasks, setTasks] = useState(initialTasks)
  const [calendarView, setCalendarView] = useState('week')
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)

  const toggleTask = (taskId) => {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, done: !task.done } : task))
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
        <button className="add-task-button" type="button"><span aria-hidden="true">＋</span> Add task</button>
      </div>

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
            />
          ) : (
            <MonthCalendar
              anchorDate={anchorDate}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
              onSelectEvent={selectEvent}
            />
          )}
          <CalendarAgenda
            selectedDate={selectedDate}
            selectedEvent={selectedEvent}
            onSelectEvent={selectEvent}
            onCloseEvent={() => setSelectedEvent(null)}
          />
          <div className="calendar-legend">
            <span><i className="legend-blue" />Class</span>
            <span><i className="legend-peach" />Focus block</span>
            <span><i className="legend-mint" />Workshop</span>
          </div>
        </div>

        <aside className="tasks-panel">
          <div className="tasks-head">
            <div><span className="section-kicker">This week</span><h2>Tasks</h2></div>
            <span className="task-count">{tasks.length - completeCount} left</span>
          </div>
          <div className="completion-card">
            <div><strong>{completeCount}/{tasks.length}</strong><span>completed</span></div>
            <div className="completion-track"><span style={{ width: `${(completeCount / tasks.length) * 100}%` }} /></div>
          </div>
          <div className="task-list">
            {tasks.map((task) => <TaskItem task={task} onToggle={toggleTask} key={task.id} />)}
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

  const startChat = () => {
    setActiveTab('chat')
    setScreen('workspace')
  }

  if (screen === 'landing') return <Landing onStart={startChat} />

  return (
    <main className="workspace">
      <AppHeader activeTab={activeTab} setActiveTab={setActiveTab} onHome={() => setScreen('landing')} />
      {activeTab === 'chat' ? <ChatView /> : <FlowView />}
    </main>
  )
}

export default App
