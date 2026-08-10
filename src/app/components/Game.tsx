"use client";

import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import gsap from "gsap";
import { motion, AnimatePresence } from 'framer-motion';
import Timer from './Timer';
import confetti from 'canvas-confetti';
import axios from "axios";

interface CustomImage extends p5.Image {
  src: string;
}

interface Piece {
  pos: p5.Vector;
  img: CustomImage;
  i: number;
  correctPos: p5.Vector;
  scaledWidth: number;
  scaledHeight: number;
  scale: number;
  opacity: number;
}

const Puzzle = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isPuzzleCompleted, setIsPuzzleCompleted] = useState(false);
  const [isConfettiLaunched, setIsConfettiLaunched] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(2026);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleTimeUpdate = (time: number) => {
    setElapsedTime(time);
  };

  const handleGameComplete = () => {
    setIsRunning(false);
    setIsGameComplete(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const generateRandomName = () => {
    const names = ["PlayerOne", "Maverick", "Phoenix", "Rogue", "Ace"];
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex] + Math.floor(Math.random() * 1000);
  };

  const generateRandomTime = () => {
    return Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
  };

  useEffect(() => {
    const sketch = (p: p5) => {
      let puzzle: PuzzleGame | undefined;
      let images: CustomImage[] = [];
      let customFont: p5.Font;
      let assetsLoaded = false;

      const imageSets: { [key: number]: string[] } = {
        2016: [
          "/images/png/2016_1.png",
          "/images/png/2016_2.png",
          "/images/png/2016_3.png",
          "/images/png/2016_4.png",
        ],
        2017: [
          "/images/png/2017_1.png",
          "/images/png/2017_2.png",
          "/images/png/2017_3.png",
          "/images/png/2017_4.png",
        ],
        2018: [
          "/images/png/2018_1.png",
          "/images/png/2018_2.png",
          "/images/png/2018_3.png",
          "/images/png/2018_4.png",
        ],
        2019: [
          "/images/png/2019_1.png",
          "/images/png/2019_2.png",
          "/images/png/2019_3.png",
          "/images/png/2019_4.png",
        ],
        2020: [
          "/images/png/2020_1.png",
          "/images/png/2020_2.png",
          "/images/png/2020_3.png",
          "/images/png/2020_4.png",
        ],
        2021: [
          "/images/png/2021_1.png",
          "/images/png/2021_2.png",
          "/images/png/2021_3.png",
          "/images/png/2021_4.png",
        ],
        2022: [
          "/images/png/2022_1.png",
          "/images/png/2022_2.png",
          "/images/png/2022_3.png",
          "/images/png/2022_4.png",
        ],
        2023: [
          "/images/png/2023_1.png",
          "/images/png/2023_2.png",
          "/images/png/2023_3.png",
          "/images/png/2023_4.png",
        ],
        2024: [
          "/images/png/2024_1.png",
          "/images/png/2024_2.png",
          "/images/png/2024_3.png",
          "/images/png/2024_4.png",
        ],
        2025: [
          "/images/png/2025_1.png",
          "/images/png/2025_2.png",
          "/images/png/2025_3.png",
          "/images/png/2025_4.png",
        ],
        2026: [
          "/images/png/2026_1.png",
          "/images/png/2026_2.png",
          "/images/png/2026_3.png",
          "/images/png/2026_4.png",
        ],
      };

      p.preload = () => {
        customFont = p.loadFont('/fonts/Satoshi-Regular.ttf');
        
        Object.values(imageSets).forEach(set => {
          set.forEach(url => {
            const img = p.loadImage(url, () => {
              if (images.length === Object.values(imageSets).flat().length) {
                assetsLoaded = true;
                setIsLoading(false);
              }
            }) as CustomImage;
            img.src = url;
            images.push(img);
          });
        });
      };

      p.setup = () => {
        if (assetsLoaded) {
          const canvasWidth = p.windowWidth;
          const canvasHeight = p.windowHeight;
          const canvas = p.createCanvas(canvasWidth, canvasHeight);
          canvas.parent(canvasRef.current!);

          initializePuzzle();
        }
      };

      const initializePuzzle = () => {
        const canvasWidth = p.windowWidth;
        const canvasHeight = p.windowHeight;
        const boxSize = Math.min(400, canvasWidth * 0.8, canvasHeight * 0.8);
        const boxX = (canvasWidth - boxSize) / 2;
        const boxY = (canvasHeight - boxSize) / 2;

        const currentImages = imageSets[currentLevel];
        puzzle = new PuzzleGame(boxX, boxY, boxSize, boxSize, currentImages.map(url => images.find(img => img.src.includes(url))!), 2);
      };

      p.draw = () => {
        p.clear();
        if (!isPuzzleCompleted) {
          puzzle?.draw();
        }
      };

      p.mousePressed = () => {
        puzzle?.mousePressed(p.mouseX, p.mouseY);
        return false;
      };

      p.mouseDragged = () => {
        puzzle?.mouseDragged(p.mouseX, p.mouseY);
        return false;
      };

      p.mouseReleased = () => {
        puzzle?.mouseReleased();
        return false;
      };

      p.touchStarted = () => {
        p.mousePressed();
        return false;
      };

      p.touchMoved = () => {
        p.mouseDragged();
        return false;
      };

      p.touchEnded = () => {
        p.mouseReleased();
        return false;
      };

      p.windowResized = () => {
        const canvasWidth = p.windowWidth;
        const canvasHeight = p.windowHeight;
        p.resizeCanvas(canvasWidth, canvasHeight);
        initializePuzzle();
      };

      class PuzzleGame {
        private pieces: Piece[] = [];
        private dragPiece: Piece | null = null;
        private isDragging = false;
        private canPlay = true;
        private clickOffset: p5.Vector = new p5.Vector(0, 0);
        private x: number;
        private y: number;
        private boxWidth: number;
        private boxHeight: number;

        constructor(
          x: number,
          y: number,
          boxWidth: number,
          boxHeight: number,
          private imgs: CustomImage[],
          private side: number
        ) {
          this.x = x;
          this.y = y;
          this.boxWidth = boxWidth;
          this.boxHeight = boxHeight;
          this.placePieces(imgs);
        }

        private placePieces(imgs: CustomImage[]) {
          this.pieces = [];
        
          const pieceWidth = this.boxWidth / this.side;
          const pieceHeight = this.boxHeight / this.side;
          const manualPositions = [
            p.createVector(this.x + pieceWidth * 0.860, this.y + pieceHeight * 0.7),
            p.createVector(this.x + pieceWidth * 1.488, this.y + pieceHeight * 0.7),
            p.createVector(this.x + pieceWidth * 0.710, this.y + pieceHeight * 1.4),
            p.createVector(this.x + pieceWidth * 1.488, this.y + pieceHeight * 1.4),
          ];
        
          for (let i = 0; i < this.side * this.side; i++) {
            const img = imgs[i];
            const correctPos = manualPositions[i];
        
            const aspectRatio = img.width / img.height;
            let scaledWidth, scaledHeight;
        
            if (aspectRatio > 1) {
              scaledWidth = pieceWidth;
              scaledHeight = pieceWidth / aspectRatio;
            } else {
              scaledHeight = pieceHeight;
              scaledWidth = pieceHeight * aspectRatio;
            }
        
            const isAbove = i < Math.floor(this.side * this.side / 2);
            const pos = this.randomPos(scaledWidth, scaledHeight, isAbove);
        
            const piece = {
              pos,
              img,
              i,
              correctPos,
              scaledWidth: scaledWidth * 1.4,
              scaledHeight: scaledHeight * 1.4,
              scale: 1,
              opacity: 0,
            };
        
            this.pieces.push(piece);
        
            gsap.fromTo(piece,
              {
                opacity: 0,
                y: piece.pos.y - piece.scaledHeight / 2 - 300,
              },
              {
                opacity: 1,
                y: piece.pos.y - piece.scaledHeight / 2,
                duration: 1.2,
                ease: "power2.out",
                delay: i * 0.1,
                onUpdate: () => {
                  piece.pos.y = Number(gsap.getProperty(piece, "y"));
                }
              }
            );
          }
        }

        private randomPos(pieceWidth: number, pieceHeight: number, isAbove: boolean) {
          const marginX = Math.min(
            50,
            (p.windowWidth - this.boxWidth) / 2 - pieceWidth
          );
        
          const marginY = Math.min(
            50,
            (p.windowHeight - this.boxHeight) / 2 - pieceHeight
          );
        
          const posX = p.random(
            Math.max(this.x - marginX, 0),
            Math.min(this.x + this.boxWidth + marginX, p.windowWidth - pieceWidth)
          );
        
          const posY = isAbove
            ? p.random(
                Math.max(150, this.y - marginY - pieceHeight),
                Math.max(0, this.y - marginY)
              )
            : p.random(
                Math.min(p.windowHeight - pieceHeight, this.y + this.boxHeight + marginY),
                Math.min(p.windowHeight + pieceHeight * 2, this.y + this.boxHeight + marginY + pieceHeight * 2)
              );
        
          return p.createVector(posX, posY);
        }

        public draw(
          paddingHeaderX: number = 0, paddingHeaderY: number = 55, 
          paddingFooterX: number = 0, paddingFooterY: number = 22, 
          fontSizeHeader: number = 21, fontSizeFooter: number = 11
        ) {
          const responsiveTextSize = p.map(p.width, 400, 1200, fontSizeHeader, fontSizeHeader + 8);
        
          p.noFill();
          p.stroke(255);
          p.rect(this.x, this.y, this.boxWidth, this.boxHeight);
        
          const drawGradient = (
            x: number,
            y: number,
            width: number,
            height: number,
            colorStart: p5.Color,
            colorEnd: p5.Color
          ) => {
            for (let i = 0; i <= height; i++) {
              const inter = p.map(i, 0, height, 0, 1);
              const col = p.lerpColor(colorStart, colorEnd, inter);
              p.stroke(col);
              p.line(x, y + i, x + width, y + i);
            }
          };
        
          p.noFill();
          p.strokeWeight(1);
          drawGradient(this.x, this.y, this.boxWidth, this.boxHeight, p.color('#C4C4C4'), p.color('#5E5E5E'));
        
          p.fill(255);
          p.textFont(customFont);
          p.textAlign(p.LEFT, p.TOP);
          p.textSize(responsiveTextSize);
        
          const firstLine = "Can You Piece Together";
          const secondLine = "the Legacy of Excel?";
          const textHeaderX = this.x + paddingHeaderX;
          const textHeaderY = this.y - responsiveTextSize - paddingHeaderY;
        
          p.text(firstLine, textHeaderX, textHeaderY);
          p.text(secondLine, textHeaderX, textHeaderY + responsiveTextSize);
        
          p.textStyle(p.BOLD);
          const underlineStart = p.textWidth("the Legacy of ");
          const underlineLength = p.textWidth("Excel");
        
          p.stroke(255);
          p.line(
            textHeaderX + underlineStart,
            textHeaderY + responsiveTextSize * 2 + 5,
            textHeaderX + underlineStart + underlineLength,
            textHeaderY + responsiveTextSize * 2 + 5
          );
        
          this.pieces.forEach((r) => {
            p.push();
            p.translate(r.pos.x, r.pos.y);
            p.scale(r.scale);
            p.tint(255, 255 * r.opacity);
            p.image(r.img, -r.scaledWidth / 2, -r.scaledHeight / 2, r.scaledWidth, r.scaledHeight);
            p.pop();
          });
        
          const madeWithText = "Made with ";
          const heartIcon = "❤‍🔥";
          const footerText = " Excel 2026";
        
          p.textSize(fontSizeFooter);
          p.textAlign(p.LEFT, 

 p.BOTTOM);
          
          p.textFont(customFont);
          p.text(madeWithText, this.x + paddingFooterX, this.y + this.boxHeight + paddingFooterY);
        
          const textWidthMadeWith = p.textWidth(madeWithText);
          p.textFont('sans-serif');
          p.text(heartIcon, this.x + paddingFooterX + textWidthMadeWith, this.y + this.boxHeight + paddingFooterY);
        
          const textWidthHeart = p.textWidth(heartIcon);
          p.textFont(customFont);
          p.text(footerText, this.x + paddingFooterX + textWidthMadeWith + textWidthHeart, this.y + this.boxHeight + paddingFooterY);
        }

        public mousePressed(x: number, y: number) {
          if (this.canPlay) {
            let m = p.createVector(x, y);
            let index: number | undefined;
            this.pieces.forEach((p, i) => {
              if (this.hits(p, m)) {
                this.clickOffset = p5.Vector.sub(p.pos, m);
                this.isDragging = true;
                this.dragPiece = p;
                index = i;
              }
            });
            if (this.isDragging && index !== undefined) {
              this.putOnTop(index);
            }
          }
        }

        private hits(p: Piece, hitpos: p5.Vector) {
          return (
            hitpos.x > p.pos.x - p.scaledWidth / 2 &&
            hitpos.x < p.pos.x + p.scaledWidth / 2 &&
            hitpos.y > p.pos.y - p.scaledHeight / 2 &&
            hitpos.y < p.pos.y + p.scaledHeight / 2
          );
        }

        public mouseDragged(x: number, y: number) {
          if (this.isDragging) {
            let dragpos = p.createVector(x, y);
            this.dragPiece!.pos = p5.Vector.add(dragpos, this.clickOffset);
          }
        }

        public mouseReleased() {
          if (this.dragPiece && this.isDragging) {
            const distToCorrectPos = this.dragPiece!.pos.dist(this.dragPiece!.correctPos);
            if (distToCorrectPos < 51) {
              this.dragPiece!.pos = this.dragPiece!.correctPos.copy();
            }
            this.isDragging = false;
            this.dragPiece = null;

            if (this.isComplete()) {
              this.canPlay = false;
              
              const tl = gsap.timeline({
                onComplete: () => {
                  if (currentLevel < 2026) {
                    setCurrentLevel(prev => prev + 1);
                    setIsPuzzleCompleted(false);
                    initializePuzzle();
                  } else {
                    setIsPuzzleCompleted(true);
                    setIsTimerRunning(false);
                    handleGameComplete();
                    
                    if (!isConfettiLaunched) {
                      setIsConfettiLaunched(true);
                      confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                      });
                    }
                    
                    const randomName = generateRandomName();
                    const randomTime = generateRandomTime();
                  
                    axios.post('https://excel-puzzle-449482785848.asia-south1.run.app/api/v1', {
                      name: randomName,
                      time: randomTime
                    })
                    .then(response => {
                      console.log("Data sent successfully with random values:", response.data);
                    })
                    .catch(error => {
                      console.error("Error sending data:", error);
                    });
                    
                    setShowModal(true);
                  }
                },
              });
            
              this.pieces.forEach((piece, i) => {
                const targetY = p.windowHeight + piece.scaledHeight * 2;
                const randomOffsetX = (Math.random() - 0.5) * 1000;
                const targetX = piece.pos.x + randomOffsetX;
            
                tl.to(piece.pos, {
                  x: targetX,
                  y: targetY,
                  rotation: Math.random() * 360,
                  duration: 2,
                  ease: "power3.inOut",
                }, i * 0.1);
              });
            }
          }            
        }

        private putOnTop(index: number) {
          const removed = this.pieces.splice(index, 1)[0];
          this.pieces.push(removed);
        }

        public updatePosition(
          x: number,
          y: number,
          boxWidth: number,
          boxHeight: number
        ) {
          this.x = x;
          this.y = y;
          this.boxWidth = boxWidth;
          this.boxHeight = boxHeight;
          this.placePieces(this.imgs);
        }

        private isComplete() {
          return this.pieces.every((p) => p.pos.equals(p.correctPos));
        }
      }
    };

    const p5Instance = new p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, [currentLevel]);

  useEffect(() => {
    if (!isLoading) {
      setIsTimerRunning(true);
    }
  }, [isLoading]);

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
    },
  };
  
  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };
  
  const splitTextIntoLetters = (text: string) => {
    return text.split('').map((char, index) => (
      <motion.span
        key={index}
        variants={letterVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.03, delay: index * 0.03 }}
      >
        {char}
      </motion.span>
    ));
  };

  return (
    <div ref={canvasRef} className="relative w-full h-screen">
      <Timer isRunning={isTimerRunning} onTimeUpdate={handleTimeUpdate} />
      <div className="absolute top-4 left-4 text-white text-2xl">
        Level: {currentLevel}
      </div>
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="absolute inset-0 bg-opacity-60 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="bg-[#110E1B] bg-opacity-90 backdrop-blur-md text-white w-screen h-screen flex flex-col justify-center items-center">
              <div className="mt-4">
                <h1 className="text-3xl mr-14 font-satoshi text-left ml-8 top-6 mr sm:text-4xl md:text-5xl font-bold mb-4 leading-snug">
                  {splitTextIntoLetters("Congratulations! You've completed all levels and uncovered Excel's history from 2016 to 2026.")}
                </h1>
                <p className="mt-4 pt-7 text-right font-satoshi bottom-12 mr-5 text-3xl sm:text-xl font-semibold">
                  Total time: <span className="text-[#FF5E79]">{formatTime(elapsedTime)}</span>. Incredible job!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Puzzle;