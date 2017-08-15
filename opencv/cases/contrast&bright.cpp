//contrast&bright.cpp

#include <iostream>
#include <stdio.h>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/highgui/highgui.hpp>

using namespace std;
using namespace cv;

int contrast;
//Ĭ�ϳ�ʼ�Աȶ�
int bright;
//Ĭ�ϳ�ʼ����
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
	//��ȡͼƬ

	img_proc = Mat::zeros(img.rows, img.cols, img.type());
	//ͬ������ͼƬ�Ĵ�С&����,һ��MATLAB���ĺ���

	contrast = 100;
	bright = 128;
	//��ʼ���Աȶ�&����
	
	namedWindow("ͼƬ���ڴ���", 0);
	createTrackbar("�Աȶ�", "ͼƬ���ڴ���", &contrast, 255, callback_cb);
	createTrackbar("������", "ͼƬ���ڴ���", &bright, 255, callback_cb);
	//����gui
	//����value��ȫ�ֱ���������*userdata����Ҫ����ʹ��

	callback_cb(contrast, 0);
	//callback_cb(bright, 0);
	//���ûص�����������ʵ����ֻҪһ�ξͿ�����

	printf("Press Q to exit. \n");
	while (char(waitKey(1) != 'q')) {

	}
	//����̨����

	return 0;

}

static void callback_cb(int, void *) {
	
	namedWindow("ԭʼͼƬ����", 0);

	for (int x = 0;x < img.rows;x++) {
		for (int y = 0;y < img.cols;y++) {
			for (int rgb = 0;rgb < 3;rgb++) {
				img_proc.at<Vec3b>(x, y)[rgb] = saturate_cast<uchar>((contrast*0.01)*(img.at<Vec3b>(x, y)[rgb]) + bright - 128);
			}
		}
	}
	//�����

	imshow("ԭʼͼƬ����", img);
	imshow("ͼƬ���ڴ���", img_proc);

}