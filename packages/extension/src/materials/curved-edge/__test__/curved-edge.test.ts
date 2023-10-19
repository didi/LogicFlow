import { getCurvedEdgePath } from '../index';

describe('test curved edge ', () => {
  test('path calculation', () => {
    const radius = 5;

    const points1 = '460,150 670,150';
    const path1 = 'M460 150 L 670 150';
    expect(
      getCurvedEdgePath(
        points1.split(' ').map((p) => p.split(',').map((a) => +a)),
        radius,
      ),
    ).toBe(path1);

    const points2 = '510,250 540,250 540,175 490,175 490,100 520,100';
    const path2 = 'M510 250L 510 250L 535 250 Q 540 250 540 245L 540 245L 540 180 Q 540 175 535 175L 535 175L 495 175 Q 490 175 490 170L 490 170L 490 105 Q 490 100 495 100L 520 100';
    expect(
      getCurvedEdgePath(
        points2.split(' ').map((p) => p.split(',').map((a) => +a)),
        radius,
      ),
    ).toBe(path2);

    const points3 = '690,120 720,120 720,50 560,50 560,260 690,260';
    const path3 = 'M690 120L 690 120L 715 120 Q 720 120 720 115L 720 115L 720 55 Q 720 50 715 50L 715 50L 565 50 Q 560 50 560 55L 560 55L 560 255 Q 560 260 565 260L 690 260';
    expect(
      getCurvedEdgePath(
        points3.split(' ').map((p) => p.split(',').map((a) => +a)),
        radius,
      ),
    ).toBe(path3);

    const point4 = '690,180 690,210 660,210 660,190 630,190 630,220';
    const path4 = 'M690 180L 690 180L 690 205 Q 690 210 685 210L 685 210L 665 210 Q 660 210 660 205L 660 205L 660 195 Q 660 190 655 190L 655 190L 635 190 Q 630 190 630 195L 630 220';
    expect(
      getCurvedEdgePath(
        point4.split(' ').map((p) => p.split(',').map((a) => +a)),
        radius,
      ),
    ).toBe(path4);
  });
});
