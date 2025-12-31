import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, language } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = language === 'ar' 
      ? `أنت مساعد أكاديمي ذكي لطلاب معاهد العبور. ساعد الطلاب في دراستهم وأجب على أسئلتهم بطريقة ودية ومفيدة. أجب باللغة العربية.`
      : `You are a smart academic assistant for Obour Institutes students. Help students with their studies and answer their questions in a friendly and helpful way. Respond in English.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: message }
    ]);

    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('AI API Error:', error);
    
    // Fallback response
    const fallbackResponse = 'I apologize, but I\'m having trouble processing your request right now. Please try again later or switch to offline mode.';
    
    return NextResponse.json({ 
      response: fallbackResponse,
      error: error.message 
    });
  }
}
