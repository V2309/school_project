# podcast_generator.py - Module tạo podcast từ PDF content

import os
# Fix FFmpeg path for pydub
os.environ["PATH"] += os.pathsep + "C:\\ffmpeg-7.1.1-essentials_build\\bin"

import google.generativeai as genai
from openai import OpenAI
import tempfile
import uuid
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Configure OpenAI API
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class PodcastGenerator:
    def __init__(self):
        self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        
    def generate_dialogue(self, pdf_content: str) -> str:
        """
        Tạo cuộc hội thoại podcast từ nội dung PDF sử dụng Gemini
        """
        prompt = f"""
        Bạn là một chuyên gia AI tạo nội dung học thuật. Nhiệm vụ của bạn là đọc kỹ nội dung file PDF được cung cấp, sau đó tạo ra một **cuộc hội thoại sinh động giữa hai người**: một người hiểu nội dung (Người B), và một người đang học, cần tìm hiểu sâu hơn (Người A).

        Yêu cầu chi tiết:
        1. Cuộc hội thoại gồm **8–12 lượt trao đổi**, mỗi lượt **1–2 câu súc tích**.
        2. Nội dung **phải bám sát kiến thức trong tài liệu**, không tự bịa thêm ngoài phạm vi.
        3. Cách trao đổi mang tính **hỏi – đáp – phân tích – phản biện – ví dụ thực tế** (giống như học nhóm chuyên sâu).
        4. Người A hỏi những điểm **khó hiểu, đáng suy ngẫm, có thể gây tranh cãi**, người B giải thích rõ ràng, có thể dùng ví dụ minh họa.
        5. Ngôn ngữ tự nhiên, gần gũi, giống sinh viên đại học đang thảo luận bài.
        6. Không lặp lại nguyên văn dài dòng từ tài liệu, hãy **diễn giải lại theo cách hiểu mạch lạc**.

        Định dạng kết quả:
        Người A: ...
        Người B: ...
        Người A: ...
        Người B: ...
        ...

        Đây là nội dung từ tài liệu PDF:
        {pdf_content}
        """
        
        try:
            response = self.gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Lỗi khi tạo dialogue với Gemini: {str(e)}")
    
    def text_to_speech(self, dialogue: str, voice_a: str = "alloy", voice_b: str = "nova") -> str:
        """
        Chuyển đổi dialogue thành audio sử dụng OpenAI TTS
        """
        try:
            # Parse dialogue thành các phần riêng biệt
            lines = dialogue.strip().split('\n')
            audio_segments = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                if line.startswith("Người A:"):
                    text = line.replace("Người A:", "").strip()
                    voice = voice_a
                elif line.startswith("Người B:"):
                    text = line.replace("Người B:", "").strip()
                    voice = voice_b
                else:
                    continue
                
                # Tạo audio segment
                with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
                    response = openai_client.audio.speech.create(
                        model="tts-1",
                        voice=voice,
                        input=text,
                        response_format="mp3"
                    )
                    response.stream_to_file(temp_file.name)
                    audio_segments.append(temp_file.name)
            
            # Merge các audio segments sử dụng pydub
            final_audio_path = os.path.join(tempfile.gettempdir(), f"podcast_{uuid.uuid4().hex}.mp3")
            
            if audio_segments:
                try:
                    # Import pydub để merge audio
                    from pydub import AudioSegment
                    
                    # Load segment đầu tiên
                    combined = AudioSegment.from_mp3(audio_segments[0])
                    
                    # Thêm khoảng lặng 0.5s giữa các câu
                    silence = AudioSegment.silent(duration=500)  # 500ms
                    
                    # Merge tất cả segments
                    for segment_path in audio_segments[1:]:
                        segment_audio = AudioSegment.from_mp3(segment_path)
                        combined = combined + silence + segment_audio
                    
                    # Export final audio
                    combined.export(final_audio_path, format="mp3")
                    
                except ImportError:
                    # Fallback: nếu không có pydub, chỉ lấy segment đầu
                    print("[WARNING] pydub not installed, using first segment only")
                    import shutil
                    shutil.copy(audio_segments[0], final_audio_path)
                
                # Cleanup temp files
                for segment in audio_segments:
                    try:
                        os.unlink(segment)
                    except:
                        pass
                        
                return final_audio_path
            else:
                raise Exception("Không thể tạo audio segments")
                
        except Exception as e:
            raise Exception(f"Lỗi khi tạo audio với OpenAI TTS: {str(e)}")
    
    def generate_podcast(self, pdf_content: str) -> Dict:
        """
        Tạo podcast hoàn chình từ PDF content
        """
        try:
            # Bước 1: Tạo dialogue
            dialogue = self.generate_dialogue(pdf_content)
            
            # Bước 2: Tạo audio
            audio_path = self.text_to_speech(dialogue)
            
            return {
                "success": True,
                "dialogue": dialogue,
                "audio_path": audio_path,
                "message": "Tạo podcast thành công!"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Lỗi khi tạo podcast: {str(e)}"
            }
