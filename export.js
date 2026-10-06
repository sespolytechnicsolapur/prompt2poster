import { createClient } from '@supabase/supabase-js';
import * as xlsx from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Inserting realistic fake contestants...');
  const fakeContestants = [
    { name: 'Aditya Patil', user_id: 'ADITYA-1024', unique_id: 'ADITYA-1024', college_name: 'MIT', is_whitelisted: true },
    { name: 'Rohan Deshmukh', user_id: 'ROHAN-2048', unique_id: 'ROHAN-2048', college_name: 'MIT', is_whitelisted: true },
  ];

  for (const c of fakeContestants) {
    const { data: existing } = await supabase.from('contestants').select('*').eq('user_id', c.user_id).single();
    if (!existing) {
      await supabase.from('contestants').insert(c);
    }
  }

  console.log('Inserting realistic fake submissions...');
  const topics = ['A Samosa Shop Opens in Space', 'AI for Renewable Energy & Climate Action'];
  
  const submissionsData = [
    {
      contestant_name: 'Aditya Patil',
      submitted_by_user_id: 'ADITYA-1024',
      round: 1,
      topic: topics[0],
      ai_prompt: "a futuristic sci-fi samosa shop located in deep space, glowing neon signs in hindi and english saying 'space samosa', an astronaut buying samosa, cinematic lighting, highly detailed 8k rendering, realistic textures.",
      url: `${supabaseUrl}/storage/v1/object/public/posters/submissions/ADITYA-1024_1790833288701.png`,
      scores: [18, 12, 8, 13, 14, 9, 4, 8],
      total: 86
    },
    {
      contestant_name: 'Aditya Patil',
      submitted_by_user_id: 'ADITYA-1024',
      round: 2,
      topic: topics[1],
      ai_prompt: "a poster showing artificial intelligence solving climate change, green futuristic smart city powered by wind and solar energy, glowing circuit boards merging with nature, typography saying 'Future Energy', vibrant colors.",
      url: `${supabaseUrl}/storage/v1/object/public/posters/submissions/ADITYA-1024_1790833288702.png`,
      scores: [17, 13, 9, 12, 13, 8, 4, 9],
      total: 85
    },
    {
      contestant_name: 'Rohan Deshmukh',
      submitted_by_user_id: 'ROHAN-2048',
      round: 1,
      topic: topics[0],
      ai_prompt: "samosa stall on mars, red dust and futuristic glass dome, alien customers eating indian street food, neon signboard, hyperrealistic, octane render, dramatic lighting.",
      url: `${supabaseUrl}/storage/v1/object/public/posters/submissions/ROHAN-2048_1790833288703.png`,
      scores: [19, 14, 7, 14, 15, 9, 4, 9],
      total: 91
    },
    {
      contestant_name: 'Rohan Deshmukh',
      submitted_by_user_id: 'ROHAN-2048',
      round: 2,
      topic: topics[1],
      ai_prompt: "concept art of ai managing solar panels in a desert, beautiful sunrise, clean UI overlay elements, hopeful tone, photography, clear readable text 'Renewable AI'.",
      url: `${supabaseUrl}/storage/v1/object/public/posters/submissions/ROHAN-2048_1790833288704.png`,
      scores: [16, 11, 8, 11, 12, 7, 3, 8],
      total: 76
    }
  ];

  for (const sub of submissionsData) {
    const { data: existingSub } = await supabase.from('submissions')
      .select('*')
      .eq('submitted_by_user_id', sub.submitted_by_user_id)
      .eq('round_number', sub.round)
      .single();
    
    if (!existingSub) {
      const evaluation = {
        issues: [
          "Some minor inconsistencies in the background details.",
          "Typography placement could be slightly improved."
        ],
        total_score: sub.total,
        design_direction: { score: Math.round(sub.total / 10), reason: "Follows the thematic direction well, capturing the intended mood.", max_score: 10 },
        visual_hierarchy: { score: sub.scores[1], reason: "Good contrast and focal points guide the eye correctly.", max_score: 15 },
        composition_layout: { score: sub.scores[3], reason: "Well-balanced framing and subject placement.", max_score: 15 },
        overall_evaluation: `A very solid submission for the ${sub.topic} theme. The prompt was well engineered resulting in a visually appealing and relevant poster.`,
        relevance_to_topic: { score: sub.scores[0], reason: "Captures the core elements of the prompt effectively.", max_score: 20 },
        prompt_authenticity: { score: sub.scores[7], reason: "The generated output closely matches the described elements in the prompt.", max_score: 10 },
        overall_communication: { score: sub.scores[6], reason: "The message of the poster is clear and impactful.", max_score: 5 },
        creativity_originality: { score: sub.scores[4], reason: "Presents a unique and imaginative take on the subject matter.", max_score: 15 },
        typography_readability: { score: sub.scores[2], reason: "Text elements are integrated decently, though some minor AI artifacts exist.", max_score: 10 }
      };

      await supabase.from('submissions').insert({
        contestant_name: sub.contestant_name,
        submitted_by_user_id: sub.submitted_by_user_id,
        topic: sub.topic,
        round_number: sub.round,
        poster_url: sub.url,
        ai_prompt_used: sub.ai_prompt,
        relevance_to_topic_score: sub.scores[0],
        visual_hierarchy_score: sub.scores[1],
        typography_readability_score: sub.scores[2],
        composition_layout_score: sub.scores[3],
        creativity_originality_score: sub.scores[4],
        color_usage_score: sub.scores[5],
        overall_communication_score: sub.scores[6],
        prompt_authenticity_score: sub.scores[7],
        total_score: sub.total,
        overall_evaluation: evaluation.overall_evaluation,
        evaluation_reasoning: evaluation,
        issues: evaluation.issues,
        poster_storage_path: 'already_uploaded'
      });
    }
  }

  console.log('Fetching leaderboard data...');
  const { data: submissions, error: subError } = await supabase.from('submissions').select('*');
  if (subError) throw subError;

  const { data: contestants, error: contError } = await supabase.from('contestants').select('*');
  if (contError) throw contError;

  const contestantMap = {};
  contestants.forEach(c => {
    contestantMap[c.user_id] = c;
  });

  const exportData = submissions.map(sub => {
    const contestant = contestantMap[sub.submitted_by_user_id];
    return {
      'UID (Unique ID)': contestant ? contestant.unique_id : sub.submitted_by_user_id,
      'Username / Name': contestant ? contestant.name : sub.contestant_name,
      'College': (contestant && contestant.college_name) || sub.college_name || 'N/A',
      'Round Number': sub.round_number,
      'Topic': sub.topic,
      'Total Marks': sub.total_score,
      'Relevance Score (20)': sub.relevance_to_topic_score,
      'Visual Hierarchy (15)': sub.visual_hierarchy_score,
      'Typography (10)': sub.typography_readability_score,
      'Composition (15)': sub.composition_layout_score,
      'Creativity (15)': sub.creativity_originality_score,
      'Color Usage (10)': sub.color_usage_score,
      'Overall Comm (5)': sub.overall_communication_score,
      'Prompt Auth (10)': sub.prompt_authenticity_score,
      'Overall Evaluation': sub.overall_evaluation,
      'Poster URL': sub.poster_url,
      'Submitted At': sub.created_at
    };
  });

  console.log(`Generating excel file for ${exportData.length} records...`);
  const worksheet = xlsx.utils.json_to_sheet(exportData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Leaderboard');

  xlsx.writeFile(workbook, 'leaderboard_export.xlsx');
  console.log('Created leaderboard_export.xlsx successfully!');
}

run().catch(console.error);
