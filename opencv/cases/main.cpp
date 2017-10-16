//main.cpp

#include <iostream>
#include <stdio.h>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/highgui/highgui.hpp>

using namespace std;
using namespace cv;

#define WIN_1 "原始图像窗口"
#define WIN_2 "图像调节窗口_1"
#define WIN_3 "图像调节窗口_2"

int bright_1 = 50; //默认初始亮度，方法1
int bright_2 = 50; //默认初始亮度，方法2
Mat img, img_1, img_2; //用于存储图像

static void callback_1(int, void *); //调节亮度的回调函数，方法1
static void callback_2(int, void *); //调节亮度的回调函数，方法2
void helptext(); //帮助文本

int main() {

	namedWindow(WIN_1, 1); //创建原始图像窗口
	namedWindow(WIN_2, 1); //创建图片调像窗口_1
	namedWindow(WIN_3, 1); //创建图片调像窗口_2
	createTrackbar("亮度", WIN_2, &bright_1, 100, callback_1); //创建用于调节亮度的滑动条
	createTrackbar("亮度", WIN_3, &bright_2, 100, callback_2); //创建用于调节亮度的滑动条

	img = imread("lena.jpg");
	if (!img.data) {
		printf("Error loading image. \n");
		return -1;
	}
	imshow(WIN_1, img);
	//读取并显示原始图像lena.jpg

	img_1 = Mat::zeros(img.rows, img.cols, img.type());
	img_2 = Mat::zeros(img.rows, img.cols, img.type());
	//同步处理图片和参考背景的大小&类型，取背景为白色

	callback_1(bright_1, 0); //调用一次回调函数，此时图像调节窗口亮度不变
	callback_2(bright_2, 0); //调用一次回调函数，此时图像调节窗口亮度不变

	helptext(); //帮助文本显示

	return 0;

}

void helptext() {

	printf("使用的opencv版本：");
	printf(CV_VERSION);
	printf("\n说明： \n\t调节滑动条以改变亮度. \n\t图像调节窗口_1：采用直接增加rgb值的方法. \n\t图像调节窗口_2：采用和白色背景线性插值外推的方法. \n");
	printf("Press Q to exit. \n");
	while (char(waitKey(1) != 'q')) {

	}

}

static void callback_1(int, void *) {

	int bright_r_1;
	bright_r_1 = bright_1 * 255 / 100; //转换成具体计算所用的相对值
	
	for (int x = 0;x < img.rows;x++) {
		for (int y = 0;y < img.cols;y++) {
			for (int rgb = 0;rgb < 3;rgb++) {
				img_1.at<Vec3b>(x, y)[rgb] = saturate_cast<uchar>(img.at<Vec3b>(x, y)[rgb] + bright_r_1 - 128);
			}
		}
	}
	//点操作，直接增减每个像素的rgb值

	imshow(WIN_2, img_1); //显示调节后图像

}

static void callback_2(int, void *) {

	double bright_r_2;
	bright_r_2 = double(bright_2) / 100; //转换成具体计算所用的相对值

	for (int x = 0;x < img.rows;x++) {
		for (int y = 0;y < img.cols;y++) {
			for (int rgb = 0;rgb < 3;rgb++) {
				img_2.at<Vec3b>(x, y)[rgb]
					= saturate_cast<uchar>(img.at<Vec3b>(x, y)[rgb] * (1.5 - bright_r_2) + 255 * (- 0.5 + bright_r_2));
			}
		}
	}
	//点操作，通过和纯白色背景的线性插值外推的方法调节亮度

	imshow(WIN_3, img_2); //显示调节后图像

}