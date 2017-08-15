//contrast&bright.cpp

#include <iostream>
#include <stdio.h>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/highgui/highgui.hpp>

using namespace std;
using namespace cv;

int contrast;
//默认初始对比度
int bright;
//默认初始亮度
Mat img, img_proc;

static void callback_cb(int, void *);

int main() {

	char src[64];
	printf("Image source: \n");
	scanf_s("%s", &src, 63);
	img = imread(src);
	if (!img.data) {
		printf("Error loading image. \n");
		return -1;
	}
	//读取图片

	img_proc = Mat::zeros(img.rows, img.cols, img.type());
	//同步处理图片的大小&类型,一个MATLAB风格的函数

	contrast = 100;
	bright = 128;
	//初始化对比度&亮度
	
	namedWindow("图片调节窗口", 0);
	createTrackbar("对比度", "图片调节窗口", &contrast, 255, callback_cb);
	createTrackbar("亮　度", "图片调节窗口", &bright, 255, callback_cb);
	//创建gui
	//由于value是全局变量，所以*userdata不需要特意使用

	callback_cb(contrast, 0);
	//callback_cb(bright, 0);
	//调用回调函数，这里实际上只要一次就可以了

	printf("Press Q to exit. \n");
	while (char(waitKey(1) != 'q')) {

	}
	//控制台命令

	return 0;

}

static void callback_cb(int, void *) {
	
	namedWindow("原始图片窗口", 0);

	for (int x = 0;x < img.rows;x++) {
		for (int y = 0;y < img.cols;y++) {
			for (int rgb = 0;rgb < 3;rgb++) {
				img_proc.at<Vec3b>(x, y)[rgb] = saturate_cast<uchar>((contrast*0.01)*(img.at<Vec3b>(x, y)[rgb]) + bright - 128);
			}
		}
	}
	//点操作

	imshow("原始图片窗口", img);
	imshow("图片调节窗口", img_proc);

}