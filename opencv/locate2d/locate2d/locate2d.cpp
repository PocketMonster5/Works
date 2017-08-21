//locate2d.cpp

//-----------------------------------------------
//程序概述：通过对预处理过的图像检测角点来得到其
//边缘的特征点集合，然后确定两幅图像特征点集的对
//应关系，导出零件的位形变化
//-----------------------------------------------

#include "locate2d.h"

int main(int argc, char** argv)
{

	//2.0需要更新的内容：重做GUI

	//帮助文本
	helptext();

	//载入图像
	loadimg();

	//图像预处理
	preproc();

	//创建窗口和滚动条  
	namedWindow("win_1", CV_WINDOW_AUTOSIZE);
	namedWindow("win_2", CV_WINDOW_AUTOSIZE);
	createTrackbar("角点检测阈值: ", "win_1", &thresh, max_thresh, on_detect);
	createTrackbar("二值图阈值：  ", "win_1", &thresh_bi, max_thresh_bi, on_detect);

	//调用一次回调函数，进行初始化  
	on_detect(0, 0);

	//轮询获取键值以决定操作
	getkey();

	return 0;

}

//图像载入函数-----------------------------------
int loadimg() {

	//1.0用载入图像部分 
	/*char src_name[64];
	printf("Image source: \n");
	scanf_s("%s", &src_name, 63);
	src = imread(src_name);*/
	src = imread("1.jpg");
	if (src.empty()) {
		printf("Error loading image. \n");
		return -1;
	}

	//显示原图
	//imshow("src", src);
}
//-----------------------------------------------

//回调函数---------------------------------------
void on_detect(int, void*)
{

	Mat dst;//目标图  
	Mat norm;//归一化后的图  
	Mat scaled;//线性变换后的八位无符号整型的图  

			   //初始化
	dst = Mat::zeros(src.size(), CV_32FC1);
	temp = src.clone();

	//化为二值图
	Laplacian(gray, border, CV_16S, 3, 1, 0, BORDER_DEFAULT);
	convertScaleAbs(border, abs_border);
	threshold(abs_border, binary, thresh_bi, max_thresh_bi, 0);

	//进行角点检测
	cornerHarris(binary, dst, 2, 3, 0.04, BORDER_DEFAULT);

	//归一化与转换  
	normalize(dst, norm, 0, 255, NORM_MINMAX, CV_32FC1, Mat());
	convertScaleAbs(norm, scaled);//将归一化后的图线性变换成8位无符号整型   

								  // 将检测到的，且符合阈值条件的角点绘制出来  
	for (int x = 0; x < norm.rows; x++)
	{
		for (int y = 0; y < norm.cols; y++)
		{
			if ((int)norm.at<float>(x, y) > thresh + 80)
			{
				circle(binary, Point(y, x), 5, Scalar(255, 255, 255), 2, 8, 0);
				circle(temp, Point(y, x), 5, Scalar(0, 0, 0), 2, 8, 0);
			}
		}
	}

	//效果显示 
	imshow("win_1", binary);
	imshow("win_2", temp);

}
//-----------------------------------------------

//图像预处理函数---------------------------------
void preproc() {

	temp = src.clone();

	GaussianBlur(src, src, Size(3, 3), 0, 0, BORDER_DEFAULT);
	cvtColor(src, gray, CV_RGB2GRAY);
	Mat element = getStructuringElement(MORPH_RECT, Size(offset * 2 + 1, offset * 2 + 1), Point(offset, offset));
	morphologyEx(gray, gray, CV_MOP_OPEN, element);

	//保存二值图，找出边界，并最终化为二值图
	Laplacian(gray, border, CV_16S, 3, 1, 0, BORDER_DEFAULT);
	convertScaleAbs(border, abs_border);
	threshold(abs_border, binary, thresh_bi, max_thresh_bi, 0);
}
//-----------------------------------------------

//轮询获取键值函数-------------------------------
int getkey() {

	while (1) {
		key = waitKey(9);
		switch (key) {
		case 27://esc
			return 0;
			break;

		case 'q':
			return 0;
			break;

		case 13://enter
			locate2d();
			break;

		case 32://space
			locate2d();
			break;

		case  'r'://重新读取图像
			restart();
			break;
		}
	}
}
//-----------------------------------------------

//重新载入图像函数-------------------------------
void restart() {
	
	loadimg();

	preproc();

}
//-----------------------------------------------

//提示文本显示函数-------------------------------
void helptext() {

	printf("零件平面定位演示程序 \t ver.1.0 \n"
		   "说明：导入2幅尺寸相同的图像来识别图像中零件的平面移动。 \n"
		   "调节滑动条来获得效果较好的特征点群，然后进行识别操作 \n"
		   "识别： 回车 / 空格 \n 重新载入图像： r \n 退出： Esc / Q \n"
	
		   "\t\t\t\t\t created by hgj \n");

}
//-----------------------------------------------

//零件定位函数-----------------------------------
void locate2d() {



}
//-----------------------------------------------