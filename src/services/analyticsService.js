const ANALYTICS_STORAGE_PREFIX = 'apexprep_test_history_v3_';
const LEGACY_ANALYTICS_STORAGE_KEY = 'apexprep_test_history';

const storageKey = (userId) => userId ? `${ANALYTICS_STORAGE_PREFIX}${userId}` : null;

export function clearTestHistory(userId) {
  try {
    if (userId) localStorage.removeItem(storageKey(userId));
    localStorage.removeItem(LEGACY_ANALYTICS_STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear test history:', err);
    return false;
  }
}


export function getTestHistory(userId) {
  if (!userId) return [];
  try {
    const data = localStorage.getItem(storageKey(userId));
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load test history:', err);
    return [];
  }
}

export function saveTestAttempt({ userId, testQuestions, userAnswers, examResults, durationMinutes }) {
  if (!userId) return false;
  try {
    const history = getTestHistory(userId);
    const newAttempt = {
      id: `personal_${Date.now()}`,
      source: 'Personal Test',
      timestamp: new Date().toISOString(),
      questionCount: testQuestions.length,
      durationMinutes,
      score: examResults.score,
      totalPossibleScore: examResults.maxScore,
      accuracy: examResults.accuracy,
      correctCount: examResults.correct,
      attemptedCount: examResults.attempted,
      subjectBreakdown: examResults.subStats,
      // Record chapter-level stats for weak-area detection
      chapterBreakdown: testQuestions.map((q) => {
        const given = userAnswers[q.id];
        const isAttempted = given !== undefined && given !== '';
        const isCorrect = isAttempted && String(given).trim().toLowerCase() === String(q.correct).trim().toLowerCase();
        return {
          subject: q.subject === 'Mathematics' ? 'Math' : q.subject,
          chapter: q.chapter || 'General',
          isAttempted,
          isCorrect
        };
      })
    };

    history.unshift(newAttempt);
    localStorage.setItem(storageKey(userId), JSON.stringify(history));
    return true;
  } catch (err) {
    console.error('Failed to save test attempt:', err);
    return false;
  }
}

function addAttemptToAggregate(aggregate, attempt) {
  aggregate.attempts.push(attempt);
  aggregate.totalScore += Number(attempt.score) || 0;
  aggregate.totalCorrect += Number(attempt.correctCount) || 0;
  aggregate.totalAttempted += Number(attempt.attemptedCount) || 0;
  (attempt.chapterBreakdown || []).forEach((item) => {
    const key = `${item.subject || 'General'}::${item.chapter || 'General'}`;
    if (!aggregate.chapterStats[key]) aggregate.chapterStats[key] = { subject: item.subject || 'General', chapter: item.chapter || 'General', total: 0, correct: 0 };
    if (item.isAttempted) { aggregate.chapterStats[key].total += 1; if (item.isCorrect) aggregate.chapterStats[key].correct += 1; }
  });
}

function emptyAnalytics() {
  return { hasData:false,totalTests:0,averageScore:0,averageAccuracy:0,totalAttemptedQuestions:0,chapterMastery:[],weakChapters:[],moderateChapters:[],strongChapters:[],recentAttempts:[] };
}

function finalizeAnalytics(a) {
  if (!a.attempts.length) return emptyAnalytics();
  const chapterMastery=Object.values(a.chapterStats).map((ch)=>{const accuracy=ch.total?Math.round(ch.correct/ch.total*100):0; const status=accuracy<45?'Weak':accuracy>=75?'Strong':'Moderate'; return {...ch,accuracy,status};});
  return {hasData:true,totalTests:a.attempts.length,averageScore:Math.round(a.totalScore/a.attempts.length),averageAccuracy:a.totalAttempted?Math.round(a.totalCorrect/a.totalAttempted*100):0,totalAttemptedQuestions:a.totalAttempted,chapterMastery,weakChapters:chapterMastery.filter(c=>c.status==='Weak'),moderateChapters:chapterMastery.filter(c=>c.status==='Moderate'),strongChapters:chapterMastery.filter(c=>c.status==='Strong'),recentAttempts:a.attempts.sort((m,n)=>new Date(n.timestamp)-new Date(m.timestamp)).slice(0,5)};
}

function buildCircleAttempt(submission, test) {
  const questions=Array.isArray(test?.questions)?test.questions:[];
  const answers=submission.answers && typeof submission.answers==='object'?submission.answers:{};
  let correctCount=0, attemptedCount=0;
  const chapterBreakdown=questions.map((q,idx)=>{const given=answers[idx]!==undefined?answers[idx]:answers[q.id]; const correct=q.correctAnswer!==undefined?q.correctAnswer:q.correct_answer; const isAttempted=given!==undefined&&given!==null&&given!==''; const isCorrect=isAttempted&&Number(given)===Number(correct); if(isAttempted)attemptedCount++; if(isCorrect)correctCount++; return {subject:q.subject||test?.subject||'General',chapter:q.chapter||test?.chapter||'General',isAttempted,isCorrect};});
  return {id:`circle_${submission.id||Date.now()}`,source:'Friend Circle Test',timestamp:submission.created_at||new Date().toISOString(),questionCount:questions.length||test?.total_questions||0,durationMinutes:Number(test?.duration_minutes)||0,score:Number(submission.score)||0,totalPossibleScore:questions.length*4||0,accuracy:Number(submission.accuracy_pct)||0,correctCount,attemptedCount,chapterBreakdown};
}

export async function getCombinedAnalytics(userId) {
  if (!userId) return emptyAnalytics();
  const aggregate={attempts:[],totalScore:0,totalCorrect:0,totalAttempted:0,chapterStats:{}};
  getTestHistory(userId).forEach((attempt)=>addAttemptToAggregate(aggregate,attempt));
  try {
    const {data: submissions,error}=await supabase.from('circle_test_submissions').select('*').eq('user_id',userId).order('created_at',{ascending:false});
    if(error) throw error;
    const ids=Array.from(new Set((submissions||[]).map(s=>s.test_id).filter(Boolean)));
    let tests=[];
    if(ids.length){const {data,error:te}=await supabase.from('circle_tests').select('id,title,subject,chapter,duration_minutes,total_questions,questions').in('id',ids); if(te) throw te; tests=data||[];}
    const map=Object.fromEntries(tests.map(t=>[t.id,t]));
    (submissions||[]).forEach(s=>addAttemptToAggregate(aggregate,buildCircleAttempt(s,map[s.test_id])));
  } catch(err) { console.error('Failed to load circle analytics:',err); }
  return finalizeAnalytics(aggregate);
}

export function computeOverallAnalytics(userId) {
  const aggregate={attempts:[],totalScore:0,totalCorrect:0,totalAttempted:0,chapterStats:{}};
  getTestHistory(userId).forEach((attempt)=>addAttemptToAggregate(aggregate,attempt));
  return finalizeAnalytics(aggregate);
}
